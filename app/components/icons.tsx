/**
 * Every line icon on the public site, drawn on one 24×24 grid with one stroke
 * so they sit at the same optical weight whatever their size. They used to be
 * drawn wherever they were needed, on 16, 20 and 24 grids at three different
 * stroke widths, and it showed when two landed side by side.
 *
 * `currentColor` throughout, so an icon takes the colour of the text it sits
 * in — including the hover colour — and stays legible in both themes. All of
 * them are decoration next to a label, hence `aria-hidden`; a control with an
 * icon and no text carries its own `aria-label`.
 */

type IconProps = {
  size?: number;
  className?: string;
};

function Stroke({ size = 20, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "shrink-0"}
    >
      {children}
    </svg>
  );
}

/** Brand marks are filled shapes rather than strokes; only the grid is shared. */
function Fill({ size = 20, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className ?? "shrink-0"}
    >
      {children}
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </Stroke>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
    </Stroke>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5L14 3Z" />
      <path d="M14 3v4.5h4.5M9 13h6M9 16.5h4" />
    </Stroke>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1 1m-1 3a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1-1" />
    </Stroke>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Stroke>
  );
}

export function VerifiedIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </Stroke>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Stroke>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Stroke>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Stroke>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </Stroke>
  );
}

/** Lines of text: the About section, which is a paragraph about me. */
export function TextIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4.5 6.5h15" />
      <path d="M4.5 11h15" />
      <path d="M4.5 15.5h10" />
    </Stroke>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3.5 12.5h17" />
    </Stroke>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m13.5 4.5-3 15" />
    </Stroke>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </Stroke>
  );
}

/** A painter's palette: the theme picker. */
export function PaletteIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.75-.8 1.75-1.7 0-.45-.17-.83-.43-1.13-.26-.3-.42-.68-.42-1.12 0-.94.76-1.7 1.7-1.7h2.05a3.85 3.85 0 0 0 3.85-3.85C20.5 6.9 16.7 3.5 12 3.5Z" />
      <circle cx="7.75" cy="11" r="1" />
      <circle cx="10.5" cy="7.25" r="1" />
      <circle cx="15" cy="7.75" r="1" />
    </Stroke>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </Stroke>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </Stroke>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </Fill>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3z" />
      <path d="M14.5 8.75c-1.9 0-3 .98-3.5 1.9V9H7v12h4v-6.6c0-1.4.8-2.4 2-2.4s2 1 2 2.4V21h4v-7.2c0-3.1-1.7-5.05-4.5-5.05Z" />
    </Fill>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Fill {...props}>
      <path d="M17.53 3h3.05l-6.66 7.61L21.75 21h-6.13l-4.8-6.28L5.32 21H2.27l7.12-8.14L2.25 3h6.29l4.34 5.74L17.53 3Zm-1.07 16.17h1.69L7.62 4.74H5.8l10.66 14.43Z" />
    </Fill>
  );
}
