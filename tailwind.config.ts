import type { Config } from 'tailwindcss'

/**
 * Member Threads theme: "Apparel your members actually want to wear."
 *
 * The brand board: Green #133327, Cream #EEE6D9, Beige #C4B19A, Dusty Blue
 * #223041. Green is the ink (type, buttons, the logo); cream and a lighter
 * paper are the grounds; beige is for plates, chips and tints (never type on
 * cream); dusty blue is the second dark, for hover states and full-bleed bands.
 * Token names are kept from the original system so components stay put:
 * `electric*` = beige/cream tints, `blue`/`uv` = dusty blue, `pop` = beige.
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand board, by name.
        green: '#133327',
        'green-2': '#1F4A3A',
        cream: '#EEE6D9',
        beige: '#C4B19A',
        'beige-deep': '#8C7A63',
        dusty: '#223041',
        // Roles.
        ink: '#133327',
        'ink-2': '#1F4A3A',
        muted: '#5D6A63',
        ash: '#EEE6D9',
        'ash-2': '#E3D8C6',
        rule: '#DCD1BF',
        paper: '#F7F3EC',
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
        oat: '#E3D8C6',
        lime: '#EEE6D9',
        aqua: '#EEE6D9',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Display sizes are set tight and heavy; they carry the page, and the
        // supporting copy under them stays deliberately small.
        label: ['11px', { lineHeight: '13px', letterSpacing: '0.12em' }],
        d0: ['clamp(2.75rem, 9.2vw, 8.25rem)', { lineHeight: '0.9', letterSpacing: '-0.035em' }],
        d1: ['clamp(2.25rem, 5vw, 4.25rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        d2: ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        d3: ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.15', letterSpacing: '-0.018em' }],
        lead: ['clamp(1rem, 1.15vw, 1.125rem)', { lineHeight: '1.55', letterSpacing: '-0.008em' }],
      },
      maxWidth: { shell: '1280px', measure: '46ch' },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
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
