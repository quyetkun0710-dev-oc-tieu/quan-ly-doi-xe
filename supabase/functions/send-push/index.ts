// Supabase Edge Function: send-push
// Gửi Web Push Notification đến người dùng đã đăng ký
// Deploy: supabase functions deploy send-push

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ====== VAPID KEYS (đặt trong Supabase Secrets) ======
// supabase secrets set VAPID_PUBLIC_KEY=...
// supabase secrets set VAPID_PRIVATE_KEY=...

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// ===== Helper: Build signed JWT for VAPID auth =====
async function buildVapidAuth(
  endpoint: string,
  publicKeyB64: string,
  privateKeyDerB64: string
): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const expiry = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header = { alg: "ES256", typ: "JWT" };
  const payload = {
    aud: audience,
    exp: expiry,
    sub: "mailto:admin@doixe.com",
  };

  const enc = (s: string) =>
    btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const toB64Url = (buf: Uint8Array) =>
    btoa(String.fromCharCode(...buf))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const headerB64 = enc(JSON.stringify(header));
  const payloadB64 = enc(JSON.stringify(payload));
  const sigInput = `${headerB64}.${payloadB64}`;

  // Import private key
  const privDer = Uint8Array.from(
    atob(privateKeyDerB64.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privDer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(sigInput)
  );

  return `${sigInput}.${toB64Url(new Uint8Array(sig))}`;
}

// ===== Helper: Encrypt payload theo Web Push spec =====
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const fromB64 = (s: string) =>
    Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
      c.charCodeAt(0)
    );

  const receiverPub = fromB64(p256dhB64);
  const authSecret = fromB64(authB64);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Generate ephemeral key pair
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
  const serverPubKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeyPair.publicKey)
  );

  // Import receiver public key
  const receiverKey = await crypto.subtle.importKey(
    "raw",
    receiverPub,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverKey },
    serverKeyPair.privateKey,
    256
  );

  // HKDF
  const hkdf = async (ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, len: number) => {
    const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info },
      key,
      len * 8
    );
    return new Uint8Array(bits);
  };

  const enc = new TextEncoder();
  const concat = (...arrays: Uint8Array[]) => {
    const len = arrays.reduce((a, b) => a + b.length, 0);
    const out = new Uint8Array(len);
    let offset = 0;
    for (const a of arrays) { out.set(a, offset); offset += a.length; }
    return out;
  };

  const prk = await hkdf(
    new Uint8Array(sharedBits),
    authSecret,
    enc.encode("WebPush: info\0" + String.fromCharCode(...receiverPub) + String.fromCharCode(...serverPubKey)),
    32
  );

  const cek = await hkdf(prk, salt, concat(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])), 16);
  const nonce = await hkdf(prk, salt, concat(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])), 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const data = new TextEncoder().encode(payload);
  const padded = concat(data, new Uint8Array([2])); // padding delimiter
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded);

  return { ciphertext: new Uint8Array(encrypted), salt, serverPublicKey: serverPubKey };
}

// ===== Main: Send push to one subscription =====
async function sendWebPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublic: string,
  vapidPrivate: string
) {
  const jwt = await buildVapidAuth(sub.endpoint, vapidPublic, vapidPrivate);
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(sub.p256dh, sub.p256dh, sub.auth);

  // Build aes128gcm content (RFC 8291)
  const recordSize = ciphertext.length + 16384; // max record size
  const header = new ArrayBuffer(21 + serverPublicKey.length);
  const view = new DataView(header);
  new Uint8Array(header).set(salt, 0);
  view.setUint32(16, recordSize, false);
  view.setUint8(20, serverPublicKey.length);
  new Uint8Array(header).set(serverPublicKey, 21);

  const body = new Uint8Array(header.byteLength + ciphertext.length);
  body.set(new Uint8Array(header), 0);
  body.set(ciphertext, header.byteLength);

  const pubKeyForAuth = btoa(
    String.fromCharCode(...Uint8Array.from(atob(vapidPublic.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)))
  ).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "Authorization": `vapid t=${jwt},k=${pubKeyForAuth}`,
      "TTL": "86400",
    },
    body: body,
  });

  return res.status;
}

// ===== MAIN HANDLER =====
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Parse body: { ma_nv?: string | string[], title, body, url? }
    const body = await req.json();
    const { ma_nv, title, body: msgBody, url = "/" } = body;

    if (!title || !msgBody) {
      return new Response(JSON.stringify({ error: "title and body required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch subscriptions
    let query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth, ma_nv");
    if (ma_nv) {
      if (Array.isArray(ma_nv)) {
        query = query.in("ma_nv", ma_nv);
      } else {
        query = query.eq("ma_nv", ma_nv);
      }
    }

    const { data: subs, error: dbError } = await query;
    if (dbError) throw dbError;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const payload = JSON.stringify({ title, body: msgBody, url, icon: "/icons/icon-192.png" });

    // Send push to all subscriptions
    const results = await Promise.allSettled(
      subs.map((sub) => sendWebPush(sub, payload, VAPID_PUBLIC, VAPID_PRIVATE))
    );

    const sent = results.filter((r) => r.status === "fulfilled" && (r.value === 201 || r.value === 200)).length;
    const failed = results.length - sent;

    // Remove expired subscriptions (status 410 Gone)
    const expiredEndpoints: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value === 410) {
        expiredEndpoints.push(subs[i].endpoint);
      }
    });
    if (expiredEndpoints.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, failed, total: subs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
