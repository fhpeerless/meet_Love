#哈哈的交友

## 部署结构

| 内容 | 由谁提供 | 域名 |
| --- | --- | --- |
| 页面本身 `index.html` | Cloudflare Pages（从本仓库 main 分支构建） | https://meet.xtwa.org |
| 静态资源 `css/ js/ photos/ lrc/` 等 | jsDelivr CDN（国内有就近节点） | https://cdn.jsdelivr.net/gh/fhpeerless/meet_Love@版本号/路径 |

jsDelivr 链接长这样：

```
https://cdn.jsdelivr.net/gh/fhpeerless/meet_Love@2026.10.13/js/main.js
                                            ↑ @ 后面就是「版本号」= Git tag
```

## 一句话规则

**改了要发布的内容 → 把 index.html 里的 @版本号 换成新版本号 → 提交 → 打同名 tag → 推送。**

## 为什么必须打 tag

jsDelivr 的缓存规则（官方文档）：

| URL 里的版本写法 | 缓存时长 | 能不能更新内容 |
| --- | --- | --- |
| `@main`（分支） | 12 小时 | 会跟着分支走，但最长 12 小时才刷新，`?v=` 这类 query 救不了 |
| `@2026.10.13`（tag / release） | 1 年 + 永久存 S3 | 内容永远不变，也不能 purge |
| `@e516ea1`（commit 哈希） | 1 年 | 同上 |

tag 是不可变快照，所以**每次发布都要打一个新 tag**：URL 里的版本变了，浏览器和 CDN 才会去取新文件。
这跟以前用 `?v=` 刷新的道理完全一样，只是从 query 换成了 URL 里的版本路径。

## 每次更新都要打 tag 吗

- **改了 `js/ css/` 等被 jsDelivr 引用的文件** → 必须打新 tag，否则访客会一直看到旧文件（tag 快照 + 一年缓存）
- **只改了 `index.html`（文案、排版、结构调整）** → 不用打 tag，push 到 main 后 Cloudflare Pages 自动重建，刷新页面即可
- **只改 `data/`、`config/` 里被 JS 用相对路径读取的文件** → 不用打 tag（它们由 Cloudflare Pages 提供，不走 jsDelivr）

## 标准发布流程

```bash
# 1) 改代码

# 2) 把 index.html 里所有 jsDelivr 链接的 @版本号 改成新版本号，例如 @2026.10.12 → @2026.10.13
#    （tag 名用日期写成三段数字，如 2026.10.13）

# 3) 可选：统一页面里的 ?v=（页面右下角显示的版本号就来自它）
python update_version.py

# 4) 提交
git add index.html js/ css/
git commit -m "本次改动说明"

# 5) 打 tag —— 名字必须和第 2 步用的版本号完全一致
git tag 2026.10.13

# 6) 推送分支和 tag（两条要连着执行，避免中间有访客拿到还没生效的资源）
git push
git push origin 2026.10.13

# 7) 验证：返回 200 且 cache-control 里带 max-age=31536000 就成功了
curl -I "https://cdn.jsdelivr.net/gh/fhpeerless/meet_Love@2026.10.13/js/main.js"
```

如果第 7 步返回 404：等几秒重试（jsDelivr 首次请求才去 GitHub 拉取）；仍然 404 就到 GitHub 用这个名字发一个 Release —— jsDelivr 对 Release 的支持是官方保证的。

## 别踩的坑

- `@main` 不要用在生产页面：12 小时缓存，且 `?v=` 无法让它立即刷新
- tag 一旦发布，内容不可改：发现发错了，要打一个新 tag 并把 index.html 指向它，**不要**想着覆盖旧 tag（jsDelivr 已把旧内容永久存库）
- tag 名要用合法格式：推荐 `2026.10.13`（点分三段数字）；`20261013` 这种单段名字会让 jsDelivr 的版本范围（`@2026.10`）等高级功能不可用
- 同一天要发第二次：在日期后面加序号，如 `2026.10.13-2`，仍然是合法版本号
- 单文件上限 20MB（GitHub 源），照片正常尺寸都没问题
- 页面里的 `data/fund-history.json`（每天由工作流更新）**不要**搬到 jsDelivr —— 固定 tag 会让它永远是旧数据

## 回滚

把 `index.html` 里的 `@新版本号` 改回 `@旧版本号`，提交推送即可 —— 旧 tag 的内容 jsDelivr 永久保留，不会失效。