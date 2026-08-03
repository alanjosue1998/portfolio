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
├── layout.tsx     # Root layout: fonts and HTML shell
├── page.tsx       # Home page
├── globals.css    # Tailwind + theme variables
└── components/    # Page sections
```

The light/dark theme comes from CSS variables in `globals.css` and follows the system preference.

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
