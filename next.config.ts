import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * The portrait is uploaded to Vercel Blob and served from the store's own
     * subdomain, which is named after the store and so is not known until one
     * exists. Only the hostname is wildcarded; `next/image` refuses to optimise
     * anything outside this pattern, which is the point of the allowlist.
     */
    remotePatterns: [new URL("https://*.public.blob.vercel-storage.com/**")],
  },
  experimental: {
    /*
     * A Server Action request is capped at 1MB by default, and the upload in
     * `app/(admin)/admin/actions.ts` sends the file through one. A photo
     * straight off a phone clears 1MB easily and would be rejected before the
     * action ever ran. This matches Vercel's own 4.5MB request ceiling, which
     * no amount of config here can raise; the action stops files at 4MB so that
     * an oversized upload gets its own message rather than a framework error.
     */
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  /**
   * Security headers on every response, public site and admin alike.
   *
   * - `frame-ancestors 'none'`: nothing here is meant to be embedded, and a
   *   page that can be framed can be clickjacked — the admin's delete buttons
   *   above all. Only this directive of CSP, not a full policy: a script and
   *   style policy would have to account for the theme script, the map's
   *   workers and Vercel Analytics, and is its own piece of work.
   * - `nosniff`: the browser takes `Content-Type` at its word.
   * - `strict-origin-when-cross-origin`: other sites see the origin a visitor
   *   came from, never the path.
   * - `Permissions-Policy`: none of these is used, so none can be switched on
   *   by anything injected later.
   * - `Strict-Transport-Security`: Vercel terminates TLS but does not send
   *   HSTS itself, so a returning visitor who types the bare domain would go
   *   out over plain HTTP before the redirect. Two years, with `preload`,
   *   which is what the browsers' preload list asks for — the token alone
   *   changes nothing until the domain is submitted to hstspreload.org.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
