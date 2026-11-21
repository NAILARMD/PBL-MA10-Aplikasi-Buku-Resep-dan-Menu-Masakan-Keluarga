#!/usr/bin/env python3
"""Membangun index.html mandiri dari src/ (CSS + JS + logo inline)."""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"

html = (SRC / "index.html").read_text(encoding="utf-8")
css = (SRC / "styles.css").read_text(encoding="utf-8")
js = (SRC / "app1.js").read_text(encoding="utf-8") + "\n" + (SRC / "app2.js").read_text(encoding="utf-8")

logo_b64 = base64.b64encode((ROOT / "assets" / "logo-quant.png").read_bytes()).decode("ascii")

# Pastikan tidak ada tag </script> liar di dalam JS
if re.search(r"</script", js, re.I):
    js = re.sub(r"</script", r"<\\/script", js, flags=re.I)

html = html.replace("/* __CSS__ */", css)
html = html.replace("__LOGO_URI__", "data:image/png;base64," + logo_b64)
html = html.replace("/* __JS__ */", "\n" + js + "\n")

out = ROOT / "index.html"
out.write_text(html, encoding="utf-8")
print(f"index.html ditulis: {out.stat().st_size / 1024:.1f} KB")
