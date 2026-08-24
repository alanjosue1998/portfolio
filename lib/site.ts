/**
 * The absolute origin the site is served from, without a trailing slash.
 *
 * `app/sitemap.ts` and `app/robots.ts` both emit absolute URLs — a relative
 * path is not a valid entry in either format — and neither runs inside a
 * request, so the origin has to come from the environment rather than from a
 * header. It lives here and not in one of those files so that the two agree,
 * and so that `metadataBase` can read the same value.
 *
 * `NEXT_PUBLIC_SITE_URL` wins when it is set: that is how a custom domain gets
 * in. Failing that, Vercel exposes the project's production domain to the
 * build, which is the right answer for a deployment that has no domain of its
 * own yet. Locally there is neither, so it falls back to the dev server —
 * `next dev` then serves a sitemap pointing at localhost, which is wrong for a
 * crawler and exactly right for checking the output by hand.
 */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  /*
   * Always the production domain, even in a preview build, so a preview never
   * ships a sitemap advertising its own throwaway URL.
   */
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl().replace(/\/+$/, "");
