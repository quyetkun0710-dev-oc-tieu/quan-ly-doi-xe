const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/gi;
let match;
let js = '';
while ((match = scriptRegex.exec(html)) !== null) {
    js += match[1] + '\n';
}
fs.writeFileSync('extracted.js', js, 'utf8');
try {
    require('vm').runInNewContext(js, { console: {}, window: {}, document: {}, navigator: {}, setInterval: () => { }, setTimeout: () => { }, sessionStorage: { getItem: () => { }, setItem: () => { } }, fetch: () => Promise.resolve({ json: () => ({ status: 'success' }) }), XLSX: { utils: { table_to_book: () => ({}) } }, Chart: class { }, html2pdf: () => ({ set: () => ({ from: () => ({ save: () => Promise.resolve() }) }) }), location: { reload: () => { } }, addEventListener: () => { }, MutationObserver: class { }, confirm: () => true });
    console.log('✅ Syntax seems fine.');
} catch (e) {
    console.log('❌ Syntax Error found:');
    console.log(e.stack);
}
