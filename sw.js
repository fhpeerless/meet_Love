/*!
 * 全站加速 Service Worker
 * 作用：拦截本站在「仓库内的静态资源」请求，自动改用 jsDelivr (GitHub) 加速地址返回。
 * 好处：HTML/CSS/JS 里原有的 ./xxx 路径完全不用改，浏览器发出的请求会被这里改写。
 *
 * 说明：
 * - 只接管「本站自己仓库文件」的 GET 请求（同源、且不是后端接口 /api、不是外部域名）。
 * - 后端接口（baba.xtwa.org 等外部域）与外部 CDN 一律不拦截，避免影响数据接口。
 * - 命中 jsDelivr 失败时自动回退到原始地址，保证不白屏。
 * - 分支内容在 jsDelivr 有缓存延迟，如需即时生效可把 REF 改成某个 commit 哈希。
 */

var GITHUB_USER = 'fhpeerless';
var REPO = 'meet_Love';
var REF = 'main'; // 也可填具体的 commit 哈希或 tag，避免缓存延迟

var JSDELIVR = 'https://cdn.jsdelivr.net/gh/' + GITHUB_USER + '/' + REPO + '@' + REF + '/';

// 只加速这些后缀的静态资源（按需增删）
var ACCEL_EXT = /\.(css|js|mjs|json|jpg|jpeg|png|gif|webp|svg|ico|woff2?|ttf|otf|lrc|mp3|mp4)$/i;

// 不放行/不加速的路径前缀（后端接口等），保持原样直连
var SKIP_PREFIX = ['/api/'];

self.addEventListener('install', function(event) {
    // 立即激活，不等旧版本
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
    var req = event.request;

    // 只处理 GET
    if (req.method !== 'GET') return;

    var url = new URL(req.url);

    // 只管同源请求，外部域名（baba.xtwa.org / 有道等）一律不接管
    if (url.origin !== self.location.origin) return;

    // 跳过接口等特殊路径
    for (var i = 0; i < SKIP_PREFIX.length; i++) {
        if (url.pathname.indexOf(SKIP_PREFIX[i]) === 0) return;
    }

    // 首页 / README 之类不放行：交给原站（避免 jsDelivr 与本页路径不一致）
    if (url.pathname === '/' || url.pathname === '/index.html') return;

    // 只加速静态资源后缀
    if (!ACCEL_EXT.test(url.pathname)) return;

    // 组装 jsDelivr 加速地址（去掉开头 '/'，去掉缓存参数）
    var rel = url.pathname.replace(/^\/+/, '');
    var target = JSDELIVR + rel;

    event.respondWith(
        fetch(target, { mode: 'cors', credentials: 'omit' })
            .then(function(res) {
                // jsDelivr 命中（200/304 等）直接返回
                if (res && (res.ok || res.status === 304)) return res;
                // 404 等异常则回退原地址
                return fetch(req);
            })
            .catch(function() {
                // 网络错误也回退原地址，保证可用
                return fetch(req);
            })
    );
});
