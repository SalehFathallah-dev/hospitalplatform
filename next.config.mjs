import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl({
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  headers: async () => [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] }, { source: "/(.*)", headers: [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }
  ]}]
});
