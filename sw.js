// Service Worker - Quản Lý Đội Xe PWA v6 (+ Web Push)
const CACHE_NAME = 'doi-xe-v6';

// Các file cần cache khi cài đặt
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// ===== INSTALL: Cache tài nguyên tĩnh =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// ===== ACTIVATE: Xóa cache cũ =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// ===== FETCH: Chiến lược Network-First =====
// Ưu tiên lấy dữ liệu mới từ mạng, fallback về cache nếu offline
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Các request tới Google Apps Script (API): luôn lấy từ mạng, KHÔNG cache
    if (url.hostname.includes('script.google.com') || url.hostname.includes('googleapis.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Các tài nguyên tĩnh (HTML, icons, CSS): Network-first, fallback cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone và lưu vào cache nếu thành công
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline: lấy từ cache
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    // Nếu không có cache: trả về trang offline
                    return new Response(
                        `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Không có kết nối</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #1a2340; color: white; text-align: center; }
    .box { padding: 40px; }
    .icon { font-size: 4rem; margin-bottom: 20px; }
    h1 { font-size: 1.5rem; margin-bottom: 10px; }
    p { opacity: 0.7; }
    button { margin-top: 20px; padding: 12px 24px; background: #3273dc; color: white;
             border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">📡</div>
    <h1>Không có kết nối mạng</h1>
    <p>Ứng dụng cần kết nối internet để hoạt động.<br>Vui lòng kiểm tra lại kết nối.</p>
    <button onclick="location.reload()">Thử lại</button>
  </div>
</body>
</html>`,
                        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                });
            })
    );
});

// ===== PUSH: Nhận Web Push Notification =====
self.addEventListener('push', (event) => {
    let data = {
        title: '🚛 Quản Lý Đội Xe',
        body: 'Có thông báo mới từ hệ thống.',
        url: '/',
        icon: './icons/icon-192.png',
        badge: './icons/icon-96.png',
    };

    if (event.data) {
        try {
            Object.assign(data, event.data.json());
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: 'doi-xe-notify',         // gộp các thông báo cùng tag
        renotify: true,               // rung lại ngay cả khi đã có tag
        vibrate: [200, 100, 200],     // rung pattern
        requireInteraction: false,    // tự đóng sau vài giây (mobile)
        data: { url: data.url },
        actions: [
            { action: 'open', title: '📱 Mở ứng dụng' },
            { action: 'dismiss', title: '✖ Bỏ qua' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ===== NOTIFICATION CLICK: Xử lý khi bấm vào notification =====
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Nếu app đang mở → focus vào tab đó
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.postMessage({ type: 'PUSH_NAVIGATE', url: targetUrl });
                    return;
                }
            }
            // Nếu chưa mở → mở tab mới
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// ===== MESSAGE: Nhận lệnh từ JS chính (skipWaiting) =====
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
