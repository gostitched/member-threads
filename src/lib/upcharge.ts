/**
 * The "try to make it cost more" board.
 *
 * Everything the section says and every option a visitor can throw at the garment
 * lives here, so the price, the fake fees and the copy can change without touching
 * the component. The fees are what the rest of the industry typically charges, and
 * are only ever shown struck out.
 *
 * Only garment decoration belongs in this list: tags, labels and packaging are
 * not included in the flat price, so they must never appear here.
 */

export type CustomizationId =
  | 'embroidery'
  | 'back'
  | 'sleeve'
  | 'location'
  | 'art'
  | 'patch'
  | 'design';

export type Customization = {
  id: CustomizationId;
  /** The control's label. */
  label: string;
  /** What a typical shop would add, in dollars. */
  fee: number;
  /** Overrides how the fee reads, e.g. an hourly rate. */
  feeText?: string;
  /** The line it prints on the ticket. */
  receipt: string;
  /** How the ticket resolves the fee. */
  verdict: 'Included' | 'Free';
  /** Technical note that appears next to the control once it has been used. */
  spec: string;
  /** Point on the garment drawing (400×400) the control's leader line runs to. */
  anchor: [number, number];
  /**
   * Where the control sits on the desktop board, in % of the stage. `side` says
   * which way the label reads from that point: out to the left or out to the right.
   */
  at: { x: number; y: number; side: 'left' | 'right' };
};

export const UPCHARGE = {
  price: 65,
  garment: 'Mockneck',

  eyebrow: 'No upcharges',
  headline: ['Try to make', 'it cost more.'],
  dare: 'Seriously. Go nuts.',

  /** Said under the price, one per attempt. `{price}` is filled in. */
  retorts: ['Still {price}.', 'Nice try.', 'Yep. Still.', 'We told you.', 'Go crazier.', 'Keep going.'],
  /** Cycled once the retorts above run out. */
  encores: ['Still no.', 'We can do this all day.', 'Honestly, go for it.', 'Nope.'],

  finale: {
    kicker: 'Told you.',
    headline: ['Creativity', 'is included.'],
    line: 'Make the best garment. Not the cheapest version of it.',
    cta: { label: 'Make something', href: '/quote' },
    reset: 'Clear the board',
  },

  options: <Customization[]>[
    {
      id: 'embroidery',
      label: 'Embroidery',
      fee: 8,
      receipt: 'Embroidery',
      verdict: 'Included',
      spec: 'L. chest · 3.5 in · 9,200 st.',
      anchor: [238, 150],
      at: { x: 70, y: 18, side: 'right' },
    },
    {
      id: 'back',
      label: 'Back print',
      fee: 6,
      receipt: 'Back print',
      verdict: 'Included',
      spec: 'Center back · 12 in · 2 colors',
      anchor: [150, 336],
      at: { x: 40, y: 88, side: 'left' },
    },
    {
      id: 'sleeve',
      label: 'Sleeve print',
      fee: 4,
      receipt: 'Sleeve print',
      verdict: 'Included',
      spec: 'R. sleeve · 1.25 × 11 in',
      anchor: [66, 300],
      at: { x: 24, y: 74, side: 'left' },
    },
    {
      id: 'location',
      label: 'Extra location',
      fee: 5,
      receipt: 'Extra location',
      verdict: 'Included',
      spec: 'Lower back · because why not',
      anchor: [232, 300],
      at: { x: 60, y: 76, side: 'right' },
    },
    {
      id: 'art',
      label: 'Custom art',
      fee: 50,
      receipt: 'Art / setup',
      verdict: 'Included',
      spec: 'Full front · screen · PMS 2728 C',
      anchor: [236, 212],
      at: { x: 76, y: 64, side: 'right' },
    },
    {
      id: 'patch',
      label: 'Patch',
      fee: 7,
      receipt: 'Patch',
      verdict: 'Included',
      spec: 'Chenille · 2.5 in · merrowed',
      anchor: [152, 170],
      at: { x: 27, y: 25, side: 'left' },
    },
    {
      id: 'design',
      label: 'Design help',
      fee: 75,
      feeText: '$75/hr',
      receipt: 'Design',
      verdict: 'Free',
      spec: 'A designer, notes attached',
      anchor: [200, 50],
      at: { x: 36, y: 7, side: 'left' },
    },
  ],
};

export const feeText = (o: Customization) => o.feeText ?? `+$${o.fee}`;
