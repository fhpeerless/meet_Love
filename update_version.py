# -*- coding: utf-8 -*-
"""
静态资源版本号更新脚本

用法：
    python update_version.py            # 自动生成新版本号并更新 index.html
    python update_version.py 20260920   # 指定版本号（日期部分）

规则：
    - 扫描 index.html 里所有 ?v=xxx，统一替换成新版本号。
    - 不指定版本号时，默认用当天日期 YYYYMMDD；若当天日期与现有版本号日期相同，
      则自动追加/递增字母序号（a、b、c...），确保每次都不同、浏览器能刷新缓存。
"""

import os
import re
import sys
import datetime

APP_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(APP_DIR, "index.html")

# 只匹配实际资源引用里的版本号：.css?v=xxx 或 .js?v=xxx（带引号包裹），
# 避免误匹配 HTML 注释里的示例文字。
VERSION_RE = re.compile(r"(?P<prefix>(?:\.css|\.js)\?v=)[A-Za-z0-9]+")


def read_index():
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return f.read()


def write_index(content):
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(content)


def current_version(content):
    m = VERSION_RE.search(content)
    return m.group(0).split("=")[-1] if m else None


def next_version(old_version):
    """依据现有版本号生成下一个版本号。"""
    today = datetime.date.today().strftime("%Y%m%d")

    # 未指定或不存在旧版本：直接用当天日期
    if not old_version:
        return today

    # 旧版本日期部分 == 今天，递增字母序号
    if old_version.startswith(today):
        # 提取末尾字母序号
        suffix_match = re.match(r"^" + today + r"([a-z]*)$", old_version)
        suffix = suffix_match.group(1) if suffix_match else ""
        if suffix == "":
            return today + "a"
        # 递增：b -> c, ... z -> za（简单处理）
        next_suffix = ""
        carry = True
        for ch in reversed(suffix):
            if carry:
                if ch == "z":
                    next_suffix = "a" + next_suffix
                else:
                    next_suffix = chr(ord(ch) + 1) + next_suffix
                    carry = False
            else:
                next_suffix = ch + next_suffix
        if carry:
            next_suffix = "a" + next_suffix
        return today + next_suffix

    # 旧版本是更早日期：直接用今天日期
    return today


def main():
    content = read_index()
    old = current_version(content)

    if len(sys.argv) > 1:
        new = sys.argv[1].strip()
    else:
        new = next_version(old)

    if old == new:
        print("版本号未变化：%s（如需强制更新请手动指定新版本号）" % new)
        return

    count = len(VERSION_RE.findall(content))
    new_content = VERSION_RE.sub(lambda m: m.group("prefix") + new, content)
    write_index(new_content)

    print("版本号已更新：%s -> %s（共替换 %d 处）" % (old or "(无)", new, count))


if __name__ == "__main__":
    main()
