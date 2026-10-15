import { SHAPES, type Part } from '@/components/catalog/GarmentArt';

/**
 * Flat technical drawings for the studio, in the same 400×400 front-on box as the
 * catalog's `GarmentArt`. The catalog's silhouettes are reused as they are; the ones
 * the catalog never needed are drawn here.
 */

const mirror = (d: string) =>
  // Reflects a path across x = 200. Only absolute commands with x,y pairs are used below.
  d.replace(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g, (_, x, y) => `${400 - Number(x)} ${y}`);

const VARSITY: Part[] = [
  { t: 'body', d: 'M152 88C168 108 232 108 248 88L292 108L288 204L288 316L112 316L112 204L108 108Z' },
  { t: 'accent', d: 'M108 108Q80 150 66 212L50 304L81 312L103 224L112 204Z' },
  { t: 'accent', d: mirror('M108 108Q80 150 66 212L50 304L81 312L103 224L112 204Z') },
  // Rib cuffs, waistband and collar, each with two stripes knitted in.
  { t: 'shade', d: 'M50 304L81 312L78 332L46 324Z' },
  { t: 'shade', d: mirror('M50 304L81 312L78 332L46 324Z') },
  { t: 'shade', d: 'M112 316L288 316L288 344L112 344Z' },
  { t: 'line', d: 'M112 325L288 325M112 333L288 333', w: 2.5 },
  { t: 'line', d: 'M49 313L79 321M48 318L78 326', w: 1.5 },
  { t: 'line', d: mirror('M49 313L79 321M48 318L78 326'), w: 1.5 },
  { t: 'line', d: 'M152 88C168 108 232 108 248 88', w: 12 },
  { t: 'line', d: 'M200 106L200 344', w: 2.5 },
  { t: 'dot', cx: 208, cy: 132, r: 4 },
  { t: 'dot', cx: 208, cy: 176, r: 4 },
  { t: 'dot', cx: 208, cy: 220, r: 4 },
  { t: 'dot', cx: 208, cy: 264, r: 4 },
  { t: 'dot', cx: 208, cy: 304, r: 4 },
  // Welt pockets, trimmed in the sleeve leather.
  { t: 'accent', d: 'M134 234L142 231L158 286L150 289Z' },
  { t: 'accent', d: mirror('M134 234L142 231L158 286L150 289Z') },
  { t: 'stitch', d: 'M108 108L112 204M292 108L288 204' },
];

const JERSEY: Part[] = [
  { t: 'body', d: 'M160 86L200 130L240 86L292 106L342 158L310 194L286 176L286 332Q200 340 114 332L114 176L90 194L58 158L108 106Z' },
  { t: 'accent', d: 'M156 84L200 132L244 84L252 88L200 146L148 88Z' },
  // Two stripes across each sleeve, parallel to the hem.
  { t: 'accent', d: 'M63.5 152.2L95.5 188.2L99 184.6L67 148.6Z' },
  { t: 'accent', d: 'M69.7 145.7L101.7 181.7L105.2 178.1L73.2 142.1Z' },
  { t: 'accent', d: mirror('M63.5 152.2L95.5 188.2L99 184.6L67 148.6Z') },
  { t: 'accent', d: mirror('M69.7 145.7L101.7 181.7L105.2 178.1L73.2 142.1Z') },
  // Mesh side panels.
  { t: 'shade', d: 'M114 186L132 190L132 333L114 331Z' },
  { t: 'shade', d: mirror('M114 186L132 190L132 333L114 331Z') },
  { t: 'stitch', d: 'M108 106L114 176M292 106L286 176M116 320Q200 328 284 320' },
];

const BABYTEE: Part[] = [
  { t: 'body', d: 'M170 126C180 140 220 140 230 126L276 140L318 176L298 202L276 190Q270 230 278 292Q200 300 122 292Q130 230 124 190L102 202L82 176L124 140Z' },
  { t: 'line', d: 'M170 126C180 140 220 140 230 126', w: 6 },
  { t: 'stitch', d: 'M124 140L124 190M276 140L276 190M127 282Q200 290 273 282M90 172L107 194M310 172L293 194' },
];

const QUARTERZIP: Part[] = [
  { t: 'body', d: 'M160 92C174 110 226 110 240 92L292 108Q320 150 333 210L351 318L320 327L296 222L288 204L288 336Q200 344 112 336L112 204L104 222L80 327L49 318L67 210Q80 150 108 108Z' },
  { t: 'body', d: 'M160 94L162 66Q200 60 238 66L240 94C226 110 174 110 160 94Z' },
  { t: 'line', d: 'M162 78Q200 72 238 78', w: 1.5 },
  { t: 'line', d: 'M200 62L200 172', w: 3 },
  { t: 'shade', d: 'M195 160L205 160L205 182L195 182Z' },
  { t: 'shade', d: 'M112 318Q200 326 288 318L288 336Q200 344 112 336Z' },
  { t: 'stitch', d: 'M160 94L112 204M240 94L288 204M52 305L82 313M348 305L318 313' },
];

const BUTTONDOWN: Part[] = [
  { t: 'body', d: 'M168 84L200 100L232 84L292 104Q318 150 330 212L346 316L318 324L296 222L286 200L286 318Q286 346 200 346Q114 346 114 318L114 200L104 222L82 324L54 316L70 212Q82 150 108 104Z' },
  { t: 'shade', d: 'M54 316L82 324L79 342L51 334Z' },
  { t: 'shade', d: mirror('M54 316L82 324L79 342L51 334Z') },
  { t: 'shade', d: 'M166 80L200 100L184 130L158 96Z' },
  { t: 'shade', d: mirror('M166 80L200 100L184 130L158 96Z') },
  { t: 'line', d: 'M193 104L193 345M207 104L207 345', w: 1.5 },
  { t: 'dot', cx: 200, cy: 140, r: 3 },
  { t: 'dot', cx: 200, cy: 184, r: 3 },
  { t: 'dot', cx: 200, cy: 228, r: 3 },
  { t: 'dot', cx: 200, cy: 272, r: 3 },
  { t: 'dot', cx: 200, cy: 316, r: 3 },
  { t: 'stitch', d: 'M226 150L262 150L262 190L244 197L226 190Z' },
  { t: 'stitch', d: 'M108 104L114 200M292 104L286 200' },
];

const WORKWEAR: Part[] = [
  ...SHAPES.jacket,
  { t: 'shade', d: 'M124 238L182 238L182 304L124 304Z' },
  { t: 'shade', d: 'M218 238L276 238L276 304L218 304Z' },
  { t: 'shade', d: 'M224 138L264 138L264 180L224 180Z' },
  { t: 'stitch', d: 'M128 244L178 244M222 244L272 244M228 144L260 144' },
];

const DRESS: Part[] = [
  { t: 'body', d: 'M164 124Q182 134 200 134Q218 134 236 124Q248 150 240 172L294 348Q200 362 106 348L160 172Q152 150 164 124Z' },
  { t: 'line', d: 'M168 124L176 66M232 124L224 66', w: 4 },
  { t: 'stitch', d: 'M160 172Q200 180 240 172M114 336Q200 350 286 336' },
];

const ROBE: Part[] = [
  { t: 'body', d: 'M168 66L232 66L300 92Q330 132 352 202L316 216L292 162L292 358L108 358L108 162L84 216L48 202Q70 132 100 92Z' },
  { t: 'shade', d: 'M166 66L188 66L214 216L194 218Z' },
  { t: 'shade', d: 'M234 66L212 66L204 126Z' },
  { t: 'shade', d: 'M108 212L292 212L292 230L108 230Z' },
  { t: 'line', d: 'M214 230L206 292M224 230L240 286', w: 5 },
  { t: 'line', d: 'M194 230L184 358', w: 1.5 },
  { t: 'stitch', d: 'M56 196L88 208M344 196L312 208M112 346L288 346' },
];

export const DRAWINGS = {
  ...SHAPES,
  varsity: VARSITY,
  jersey: JERSEY,
  babytee: BABYTEE,
  quarterzip: QUARTERZIP,
  buttondown: BUTTONDOWN,
  workwear: WORKWEAR,
  dress: DRESS,
  robe: ROBE,
} satisfies Record<string, Part[]>;

export type Drawing = keyof typeof DRAWINGS;
