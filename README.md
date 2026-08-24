# Portfolio

Personal site of Alan Rueda — systems engineer focused on CMS work, building with Drupal and WordPress.

## Stack

- **Next.js 16** with the App Router
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Geist** typeface, loaded through `next/font`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page reloads as you save.

## Scripts

| Command                | What it does               |
| ---------------------- | -------------------------- |
| `npm run dev`          | Development server         |
| `npm run build`        | Production build           |
| `npm run start`        | Serve the production build |
| `npm run lint`         | Check for errors (ESLint)  |
| `npm run format`       | Format the whole project   |
| `npm run format:check` | Check formatting only      |

## Structure

```
app/
├── [lang]/
│   ├── layout.tsx   # Root layout: fonts and HTML shell
│   └── page.tsx     # Home page
├── components/      # Page sections
├── globals.css      # Tailwind + theme variables
├── sitemap.ts       # /sitemap.xml, one entry per locale
└── robots.ts        # /robots.txt
dictionaries/        # Translated strings, one file per locale
├── es.json
└── en.json
lib/
├── i18n.ts          # Supported locales and the default
├── dictionaries.ts  # Loads the dictionary for the current locale
└── site.ts          # The absolute origin the site is served from
proxy.ts             # Redirects "/" to a locale
```

The light/dark theme comes from CSS variables in `globals.css` and follows the system preference.

## Internationalization

The site is bilingual. Every route lives under a locale segment, so `/es` and
`/en` are the two entry points and `/` redirects to one of them.

**No user-facing text belongs in a component.** Strings live in
`dictionaries/*.json` and components read them:

```tsx
import { getDictionary } from "@/lib/dictionaries";

export default async function About() {
  const dict = await getDictionary();
  return <h2>{dict.about.heading}</h2>;
}
```

`getDictionary()` takes no arguments. It reads the locale from the `[lang]` root
segment via [`next/root-params`](https://nextjs.org/docs/app/api-reference/functions/next-root-params),
so the locale never has to be passed down through props — any Server Component
can call it directly.

### Adding a string

1. Add the key to **both** `dictionaries/es.json` and `dictionaries/en.json`.
2. Read it with `dict.your.key`.

`Dictionary` is typed from `es.json`, so if the two files drift out of shape it
is a compile error, not a missing string in production.

### Adding a locale

1. Add it to `locales` in `lib/i18n.ts`.
2. Create `dictionaries/<locale>.json`.
3. Add a loader entry in `lib/dictionaries.ts`.

Both pages are prerendered at build time, one per locale, via
`generateStaticParams` in the root layout.

### Locale detection

`proxy.ts` reads the `Accept-Language` header and redirects `/` to the best
supported match, honouring quality values and ignoring region subtags
(`en-GB` matches `en`). Requests it cannot match fall back to `defaultLocale`.

> Note: `proxy.ts` is what earlier Next.js versions called `middleware.ts`. The
> `middleware` convention is deprecated in Next.js 16.

## Formatting and code quality

This project uses **Prettier** for formatting and **ESLint** for errors. Both run automatically on every `git commit`.

### What happens on commit

A Git hook (Husky + lint-staged) checks **only the files you are committing**:

1. Prettier formats them and adds the changes to the commit automatically.
2. ESLint checks them. **If it reports any error or warning, the commit is aborted.**

If the commit is aborted, fix what ESLint reports and commit again. Nothing is lost — your files are left exactly as they were.

### Format on save (VS Code)

Install the `esbenp.prettier-vscode` extension and create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

### Configuration

| File                            | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `.prettierrc.json`              | Formatting rules                   |
| `.prettierignore`               | Files Prettier skips               |
| `.husky/pre-commit`             | The hook that runs before a commit |
| `lint-staged` in `package.json` | What runs, and on which files      |

> New contributors only need `npm install` — the hook installs itself.

## Deploy

Deployed on [Vercel](https://vercel.com/new). Connect the repository and every push to the main branch ships automatically.

`/sitemap.xml` and `/robots.txt` are generated at build time and need to know
the origin the site is served from. On Vercel that is the project's production
domain, picked up automatically. Set `NEXT_PUBLIC_SITE_URL` to override it once
there is a custom domain; without either, the URLs point at `localhost:3000`.
