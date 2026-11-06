/**
 * 实现层视觉令牌（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/shared/tokens.css.mjs。
 *       本文件是「实现层唯一取值来源」——页面模块只许写 var(--wx-*)，
 *       出现任何 hex 都会被验收脚本 S3 与构建期 [取值越界] 判为自创取值。
 *
 * 新增取值的顺序（references/implementation.md 第 1 节）：
 *   先改规范层 → 再改本文件 → 最后重建所有 deployed: true 的模块。
 *   不要在页面模块里「顺手补一个颜色」，也不要把色表复制进文档。
 *
 * 本文件同时承载全局 reset 与 [hidden] 规则。[hidden] 必须带 !important：
 *   .wx-scope{display:flex}、.page:not([hidden]){display:block} 这类规则
 *   会压过浏览器默认的 [hidden]{display:none}，漏写会出现「该隐藏的下拉照样显示」。
 */
export const TOKENS_CSS = `
:root{
  --wx-primary-50:#eff6ff;
  --wx-primary-100:#dbeafe;
  --wx-primary-500:#2563eb;
  --wx-primary-600:#1d4ed8;
  --wx-gray-50:#f8fafc;
  --wx-gray-100:#f1f5f9;
  --wx-gray-200:#e2e8f0;
  --wx-gray-400:#94a3b8;
  --wx-gray-500:#64748b;
  --wx-gray-700:#334155;
  --wx-gray-900:#0f172a;
  --wx-white:#ffffff;
  --wx-success-soft:#e8f5e9;
  --wx-success-500:#16a34a;
  --wx-warn-soft:#fff7e6;
  --wx-warn-500:#d97706;
  --wx-error-soft:#fdecec;
  --wx-error-500:#e5484d;
  --wx-info-soft:#eef2ff;
  --wx-info-500:#4f46e5;
  --wx-mall-50:#fff7ed;
  --wx-mall-500:#ea580c;
  --wx-mall-600:#c2410c;
  --wx-fs-xs:12px;
  --wx-fs-sm:13px;
  --wx-fs-md:14px;
  --wx-fs-lg:16px;
  --wx-fs-xl:20px;
  --wx-fs-2xl:24px;
  --wx-sp-1:4px;
  --wx-sp-2:8px;
  --wx-sp-3:12px;
  --wx-sp-4:16px;
  --wx-sp-6:24px;
  --wx-sp-8:32px;
  --wx-r-sm:6px;
  --wx-r-md:8px;
  --wx-r-pill:999px;
  --wx-border:1px solid var(--wx-gray-200);
  --wx-shadow:0 1px 3px rgba(15,23,42,.08);
  --wx-side-w:188px;
  --wx-side-collapsed:64px;
  --wx-top-h:54px;
  --wx-head-h:54px;
  --wx-touch:44px;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;
  font-size:var(--wx-fs-md);
  color:var(--wx-gray-900);
  background:var(--wx-gray-50);
  -webkit-font-smoothing:antialiased;
}
[hidden]{display:none !important}
button,input,select{font:inherit;color:inherit}
button{cursor:pointer}
`;
