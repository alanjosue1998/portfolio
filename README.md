# Portfolio

Sitio personal de Alan Rueda — ingeniero de sistemas enfocado en CMS, trabajando con Drupal y WordPress.

## Stack

- **Next.js 16** con App Router
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- Tipografía **Geist**, cargada con `next/font`

## Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La página se recarga sola al guardar.

## Scripts

| Comando                | Qué hace                     |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Servidor de desarrollo       |
| `npm run build`        | Build de producción          |
| `npm run start`        | Sirve el build de producción |
| `npm run lint`         | Busca errores con ESLint     |
| `npm run format`       | Formatea todo el proyecto    |
| `npm run format:check` | Revisa el formato sin tocar  |

## Estructura

```
app/
├── layout.tsx     # Layout raíz: fuentes y estructura HTML
├── page.tsx       # Página principal
├── globals.css    # Tailwind + variables de tema
└── components/    # Secciones del sitio
```

El tema claro/oscuro sale de variables CSS en `globals.css` y sigue la preferencia del sistema.

## Formato y calidad de código

El proyecto usa **Prettier** (formato) y **ESLint** (errores). Se ejecutan automáticamente en cada `git commit`.

### Qué pasa al hacer commit

Un hook de Git (Husky + lint-staged) revisa **solo los archivos que estás commiteando**:

1. Prettier los formatea y añade los cambios al commit automáticamente.
2. ESLint los revisa. **Si encuentra algún error o warning, el commit se cancela.**

Si se cancela, arregla lo que reporta ESLint y vuelve a commitear. No se pierde nada: tus archivos quedan como estaban.

### Formatear al guardar (VS Code)

Instala la extensión `esbenp.prettier-vscode` y crea `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

### Configuración

| Archivo                         | Para qué                            |
| ------------------------------- | ----------------------------------- |
| `.prettierrc.json`              | Reglas de formato                   |
| `.prettierignore`               | Archivos que Prettier ignora        |
| `.husky/pre-commit`             | El hook que corre antes del commit  |
| `lint-staged` en `package.json` | Qué se ejecuta y sobre qué archivos |

> Los colaboradores nuevos solo necesitan `npm install` — el hook se instala solo.

## Deploy

Se despliega en [Vercel](https://vercel.com/new). Conecta el repositorio y cada push a la rama principal publica automáticamente.
