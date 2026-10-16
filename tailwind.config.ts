import type { Config } from 'tailwindcss'

/**
 * Member Threads theme. The system is specified in DESIGN.md; read that first.
 *
 * Board: Green #133327, Cream #EEE6D9, Beige #C4B19A, Dusty Blue #223041.
 * Green is the ink and the clubhouse band; paper (a lifted cream) is the main
 * ground, cream the alternate; beige is thread, hairlines and plates (never
 * body type on light grounds); dusty blue is a rare second dark.
 * Legacy token names are kept so existing components stay put:
 * `electric*` = beige/cream tints, `blue`/`uv` = dusty blue, `pop` = beige.
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand board, by name.
        green: '#133327',
        'green-2': '#1F4A3A',
        'green-deep': '#0D241B',
        cream: '#EEE6D9',
        beige: '#C4B19A',
        'beige-deep': '#8C7A63',
        dusty: '#223041',
        // Roles.
        ink: '#133327',
        'ink-2': '#1F4A3A',
        muted: '#55625A',
        ash: '#EEE6D9',
        'ash-2': '#E4DACA',
        rule: '#D3C8B6',
        'rule-dark': '#2F4B3F',
        paper: '#F4EFE6',
        // Errors only. Not a brand colour.
        alert: '#9B2C1F',
        // Beige plates, chips and tints. Never type on light grounds.
        electric: '#C4B19A',
        'electric-deep': '#223041',
        'electric-lit': '#EEE6D9',
        blue: '#223041',
        'blue-glow': '#C4B19A',
        // Accent type: dusty blue on light grounds, beige on dark ones.
        uv: '#223041',
        'uv-lit': '#C4B19A',
        pop: '#C4B19A',
        'pop-lit': '#EEE6D9',
        // Legacy aliases.
        sky: '#C4B19A',
        cherry: '#223041',
        hotpink: '#223041',
        grape: '#223041',
        tangerine: '#8C7A63',
        cobalt: '#223041',
        forest: '#133327',
        blush: '#C4B19A',
        navy: '#223041',
        oat: '#E4DACA',
        lime: '#EEE6D9',
        aqua: '#EEE6D9',
      },
      fontFamily: {
        // Archivo: body, UI, labels.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Archivo 900 at full width: the block "THREADS" caps.
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        block: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Newsreader: the editorial voice (headlines, leads, quotes).
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        // Yellowtail: the script. `font-serif` is its LEGACY name; use `font-script`.
        script: ['var(--font-script)', 'cursive'],
        serif: ['var(--font-serif)', 'cursive'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Legacy display sizes, retuned to the new scale (d0 = mast-ish, d1 = h1...).
        label: ['11.5px', { lineHeight: '14px', letterSpacing: '0.16em' }],
        d0: ['clamp(3rem, 10vw, 9.5rem)', { lineHeight: '0.86', letterSpacing: '-0.03em' }],
        d1: ['clamp(2.5rem, 5.6vw, 5rem)', { lineHeight: '0.96', letterSpacing: '-0.025em' }],
        d2: ['clamp(1.875rem, 3.4vw, 3rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        d3: ['clamp(1.375rem, 2vw, 1.875rem)', { lineHeight: '1.12', letterSpacing: '-0.012em' }],
        lead: ['clamp(1.125rem, 1.4vw, 1.375rem)', { lineHeight: '1.5', letterSpacing: '-0.006em' }],
        // The new scale. Pair with the .t-* classes in globals.css, which also
        // set family, weight and width; these are for one-off size overrides.
        mast: ['clamp(3.5rem, 15vw, 16rem)', { lineHeight: '0.8', letterSpacing: '-0.035em' }],
        display: ['clamp(2.875rem, 7.4vw, 8rem)', { lineHeight: '0.94', letterSpacing: '-0.03em' }],
        h1: ['clamp(2.375rem, 4.8vw, 4.75rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        h2: ['clamp(1.875rem, 3.2vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.375rem, 1.9vw, 1.75rem)', { lineHeight: '1.15', letterSpacing: '-0.012em' }],
        body: ['clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)', { lineHeight: '1.6', letterSpacing: '0' }],
        small: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.002em' }],
        eyebrow: ['11.5px', { lineHeight: '14px', letterSpacing: '0.18em' }],
        spec: ['12px', { lineHeight: '16px', letterSpacing: '0.06em' }],
      },
      maxWidth: { shell: '1536px', measure: '56ch', 'measure-tight': '38ch', 'measure-wide': '72ch' },
      spacing: {
        // Section rhythm (see .sec in globals.css). gutter = grid gap.
        gutter: 'var(--gutter)',
        'sec-sm': 'var(--sec-sm)',
        sec: 'var(--sec)',
        'sec-lg': 'var(--sec-lg)',
      },
      transitionDuration: { quick: '180ms', base: '420ms', slow: '900ms' },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
        // The needle: a quick pull, a soft stop. For draws, underlines, wipes.
        stitch: 'cubic-bezier(0.7, 0, 0.2, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-rev': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(3%, -4%, 0) scale(1.12)' },
        },
        stitch: {
          to: { strokeDashoffset: '0' },
        },
        // Keep in sync with @keyframes slap in globals.css. Lands at --r.
        slap: {
          '0%': { opacity: '0', transform: 'scale(1.12) rotate(calc(var(--r, 0deg) - 2deg))' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(var(--r, 0deg))' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        'marquee-rev': 'marquee-rev 48s linear infinite',
        drift: 'drift 22s ease-in-out infinite',
        slap: 'slap 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
export default config
