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
};

export default nextConfig;
