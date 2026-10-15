import type { Config } from 'tailwindcss'

/**
 * The Mitzvah Studio theme: "Every kid gets a drop."
 *
 * Bold flat color fields, one per section, with ink or paper type. Hot pink
 * (`electric`) is the signature. pop / lime are grounds and chip fills only,
 * never type; electric-lit is the only pink allowed as type on ink.
 * Token names are kept from the original system so components stay put.
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WHITE: navy type on an off-white ground, baby-blue + pink accents.
        ink: '#0E1A47',
        'ink-2': '#1A2A5E',
        muted: '#5C6584',
        ash: '#F1EEE7',
        'ash-2': '#E9E5DC',
        rule: '#DCD8CF',
        paper: '#F8F6F1',
        // Baby blue: plates, chips, tints. Never type.
        electric: '#A9CCF4',
        'electric-deep': '#2B5BD7',
        'electric-lit': '#DCE9F9',
        blue: '#2B5BD7',
        'blue-glow': '#A9CCF4',
        // Raspberry (accent type, doodles) and sticker pink.
        uv: '#C8336E',
        'uv-lit': '#F9A8C9',
        pop: '#F9A8C9',
        'pop-lit': '#FDDAE6',
        cream: '#F5EEDC',
        // Legacy aliases.
        sky: '#A9CCF4',
        cherry: '#C8336E',
        hotpink: '#C8336E',
        grape: '#C8336E',
        tangerine: '#C8336E',
        cobalt: '#2B5BD7',
        forest: '#2B5BD7',
        blush: '#F9A8C9',
        navy: '#0E1A47',
        oat: '#E9E5DC',
        lime: '#DCE9F9',
        aqua: '#DCE9F9',
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
