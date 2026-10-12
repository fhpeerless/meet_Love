#哈哈的交友

## 部署结构

页面和全部静态资源（css / js / 图片 / lrc）都由 Cloudflare Pages 从本仓库 `main` 分支构建，域名 https://meet.xtwa.org。

## 日常更新流程

```bash
# 1) 改代码

# 2) 改过 css/js 就跑一下：统一刷新页面里的 ?v=，浏览器不吃旧缓存
python update_version.py

# 3) 提交推送，Cloudflare Pages 会自动重建，刷新页面即可生效
git add .
git commit -m "本次改动说明"
git push
```

不需要打 tag。

## 关于国内访问速度

2026-10-12 试过把 css/js 切到 jsDelivr（`@tag` 精确版本），国内实测**反而更慢**：资源全部跨域，多一次 DNS + TLS 握手，也无法复用与页面同源的 HTTP/2 连接。已回滚，**不要再用 jsDelivr 托管本站资源**。

真要解决国内访问，唯一正规路径是域名 ICP 备案后接入国内 CDN（如腾讯云 EdgeOne 免费版）。

## 已做的优化（不要改回去）

- **不在 head 预加载外部 Chart.js**：改由 `main.js` 点开「爱心储罐」时懒加载。外部请求一旦卡住，后面所有 defer 脚本都会排队干等，页面长时间空白
- **`body` 背景设为 `#03061a`**：JS 没跑起来时也不是白屏
- **`stars-bg.js` 放在脚本队列最前**：星空背景最先渲染
- **已移除 jscex**：爱心树动画改用原生 async/await，少下载约 110KB，也没有运行时编译阻塞