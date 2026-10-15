/**
 * The hoodie, as geometry.
 *
 * Traced from the studio's technical flat (front view, 1932 units wide, centre line
 * at x = 966) and rebuilt from pieces — hood, lining, body, sleeves, cuffs, hem band,
 * pocket — so each piece can take its own colour and texture. Only the left half is
 * written down; the right is its mirror.
 *
 * Fit is two numbers: `w` pushes the side seams, sleeves and cuffs out (or in), `l`
 * lengthens or crops the body, taking the hem band and pocket with it. The hood,
 * neck and shoulders never move, which is what keeps the garment reading as the
 * same garment while its silhouette changes.
 */

type Pt = [number, number];
type Seg = { c?: [Pt, Pt]; p: Pt };
type Chain = { s: Pt; segs: Seg[] };

export const AXIS = 1932;
/** The drawing's square frame, in drawing units. */
export const VIEW = { x: 150, y: 150, size: 1632 };

const n = (v: number) => Math.round(v * 10) / 10;
const pt = ([x, y]: Pt) => `${n(x)} ${n(y)}`;

function d(ch: Chain, move = true) {
  return (
    (move ? `M${pt(ch.s)}` : '') +
    ch.segs.map((g) => (g.c ? `C${pt(g.c[0])} ${pt(g.c[1])} ${pt(g.p)}` : `L${pt(g.p)}`)).join('')
  );
}

/** The same chain, walked from its end back to its start. */
function rev(ch: Chain): Chain {
  const pts = [ch.s, ...ch.segs.map((g) => g.p)];
  const segs: Seg[] = [];
  for (let i = ch.segs.length - 1; i >= 0; i--) {
    const g = ch.segs[i];
    segs.push({ c: g.c ? [g.c[1], g.c[0]] : undefined, p: pts[i] });
  }
  return { s: pts[pts.length - 1], segs };
}

const flip = ([x, y]: Pt): Pt => [AXIS - x, y];
function mirror(ch: Chain): Chain {
  return { s: flip(ch.s), segs: ch.segs.map((g) => ({ c: g.c ? [flip(g.c[0]), flip(g.c[1])] : undefined, p: flip(g.p) })) };
}

const C = (a: Pt, b: Pt, p: Pt): Seg => ({ c: [a, b], p });
const L = (p: Pt): Seg => ({ p });

/** Several chains that meet end to start, as one closed outline. */
const closed = (...chs: Chain[]) => d(chs[0]) + chs.slice(1).map((c) => d(c, false)).join('') + 'Z';
/** A chain and its mirror, as two open strokes. */
const both = (ch: Chain) => d(ch) + d(mirror(ch));

// ── Pieces that never move ───────────────────────────────────────────────────

const HOOD =
  'M632 462C615 450 614 430 625 414C645 370 660 290 670 255C690 195 900 186 965 186C1110 188 1235 220 1255 255' +
  'C1280 290 1300 420 1312 432C1325 447 1318 457 1300 462C1250 485 1100 530 975 566C960 569 950 569 940 570C880 560 760 515 632 462Z';

const LINING =
  'M697 310C680 280 720 245 800 232C900 220 1050 225 1110 237C1170 247 1210 262 1225 272C1260 300 1245 330 1230 350' +
  'C1180 420 1100 470 1060 490C1020 510 990 525 972 540C962 525 956 516 950 510C930 490 880 450 850 430' +
  'C830 420 800 400 735 356C720 345 700 330 697 310Z';

/** Folds inside the hood and the crossover at the neck. */
const FOLDS = [
  'M813 333C870 360 935 420 950 510',
  'M1085 374C1040 400 1000 430 992 450C977 480 973 515 975 540',
].join('');
/** The hood's front edges crossing at the neck, and the neckline below them. */
const NECK_LINES = [
  'M630 452C700 478 800 510 917 535',
  'M1305 453C1200 490 1090 530 982 563',
  'M940 570C952 556 962 548 972 540',
  'M745 493C800 530 880 562 940 570C962 572 995 571 1010 568C1080 555 1130 530 1165 507',
].join('');
const HOOD_LINES = FOLDS + NECK_LINES;

/**
 * The back of the hood's inside, between the two drape lines: the deepest part
 * of the opening, so it takes the most shadow.
 */
const LINER_BACK =
  'M800 236C806 285 810 318 813 333C870 360 935 420 950 510C958 522 965 532 972 540' +
  'C973 515 977 480 992 450C1000 430 1040 400 1085 374C1098 330 1106 282 1110 240C1000 226 900 226 800 236Z';

/** The neckline's topstitch. */
const NECK_STITCH = 'M715 487C790 545 880 588 965 589C1060 588 1140 545 1218 492';

export type HoodieGeometry = {
  hood: string;
  lining: string;
  hoodLines: string;
  /** Drape lines inside the hood. */
  folds: string;
  neckLines: string;
  neckStitch: string;
  body: string;
  /** The body's outline without the top edge, which is hidden under the hood. */
  bodyEdge: string;
  /** The inside back of the hood. */
  linerBack: string;
  sleeves: [string, string];
  cuffs: string;
  /** Topstitch just inside the hem band's top edge. */
  hemStitch: string;
  hem: string;
  pocket: string;
  /** Outline details: the side lines above the seam, the pocket bag edges. */
  lines: string;
  /** Topstitching: drop-shoulder seams and pocket openings. */
  stitches: string;
  /** Where things sit, for callouts, dimension lines and decoration. */
  marks: {
    /** Body width is measured across this height. */
    chestY: number;
    chestL: number;
    chestR: number;
    hemTop: number;
    hemBottom: number;
    pocketTop: number;
    sleeveL: Pt;
    sleeveR: Pt;
    shoulder: Pt;
  };
};

/** `band` is the hem band's height: a heavier fabric carries a deeper rib. */
export function hoodie({ w, l, band = 100 }: { w: number; l: number; band?: number }): HoodieGeometry {
  const X = (x: number) => x - w;
  const e = 1640 + l; // top of the hem band
  const k = (t: number) => 1470 + (e - 1470) * t;

  const shoulder: Chain = { s: [642, 458], segs: [C([610, 470], [580, 485], [555, 510]), C([510, 555], [X(450), 680], [X(415), 772])] };
  const seam: Chain = { s: [X(415), 772], segs: [C([X(470), 795], [X(520), 830], [X(541), 883])] };
  const upperSide: Chain = { s: [X(541), 883], segs: [C([X(510), 1100], [X(480), 1300], [X(490), 1470])] };
  const side: Chain = { s: upperSide.s, segs: [...upperSide.segs, C([X(495), k(0.5)], [X(505), k(0.78)], [X(520), e])] };
  const hemTop: Chain = { s: [X(520), e], segs: [C([700, e - 12], [1232, e - 12], [AXIS - X(520), e])] };

  const sleeveOuter: Chain = {
    s: [X(415), 772],
    segs: [
      C([X(380), 850], [X(350), 920], [X(330), 970]),
      C([X(280), 1100], [X(240), 1250], [X(215), 1350]),
      C([X(200), 1450], [X(195), 1550], [X(192), 1582]),
      C([X(192), 1595], [X(198), 1604], [X(205), 1608]),
    ],
  };
  const cuffTop: Chain = { s: [X(205), 1608], segs: [L([X(383), 1675])] };
  const sleeveInner: Chain = { s: [X(383), 1675], segs: [C([X(430), 1660], [X(485), 1580], [X(490), 1470])] };
  const cuff: Chain = {
    s: [X(205), 1608],
    segs: [
      L([X(383), 1675]),
      C([X(368), 1688], [X(360), 1768], [X(340), 1762]),
      L([X(208), 1720]),
      C([X(196), 1716], [X(200), 1690], [X(203), 1668]),
      C([X(205), 1640], [X(205), 1620], [X(205), 1608]),
    ],
  };

  const body = closed(shoulder, seam, side, hemTop, rev(mirror(side)), rev(mirror(seam)), rev(mirror(shoulder)));
  const bodyEdge = [shoulder, seam, side, hemTop, rev(mirror(side)), rev(mirror(seam)), rev(mirror(shoulder))]
    .map((c, i) => d(c, i === 0))
    .join('');
  const sleeve = closed(sleeveOuter, cuffTop, sleeveInner, rev(upperSide), rev(seam));
  const sleeves: [string, string] = [sleeve, closed(mirror(sleeveOuter), mirror(cuffTop), mirror(sleeveInner), rev(mirror(upperSide)), rev(mirror(seam)))];
  const cuffs = closed(cuff) + closed(mirror(cuff));
  const hem = `M${pt([X(520), e])}C${pt([700, e - 12])} ${pt([1232, e - 12])} ${pt([AXIS - X(520), e])}L${pt([AXIS - X(553), e + band])}L${pt([X(553), e + band])}Z`;

  // The pocket rides with the hem: cropping the body lifts it.
  const P = (y: number) => y + l;
  const pocket =
    `M733 ${P(1253)}L1199 ${P(1253)}C1232 ${P(1353)} 1262 ${P(1440)} 1324 ${P(1515)}L1288 ${P(1631)}` +
    `L644 ${P(1631)}L608 ${P(1515)}C670 ${P(1440)} 700 ${P(1353)} 733 ${P(1253)}Z`;

  const hemStitch = `M${pt([X(528), e + 16])}C${pt([700, e + 4])} ${pt([1232, e + 4])} ${pt([AXIS - X(528), e + 16])}`;
  const lines = both({ s: [X(568), 645], segs: [L([X(541), 883])] });
  const stitches =
    both({ s: [X(420), 763], segs: [C([X(475), 783], [X(525), 820], [X(543), 862])] }) +
    both({ s: [756, P(1253)], segs: [C([740, P(1330)], [700, P(1470)], [620, P(1538)])] });

  return {
    hood: HOOD,
    lining: LINING,
    hoodLines: HOOD_LINES,
    folds: FOLDS,
    neckLines: NECK_LINES,
    neckStitch: NECK_STITCH,
    body,
    bodyEdge,
    linerBack: LINER_BACK,
    sleeves,
    cuffs,
    hem,
    hemStitch,
    pocket,
    lines,
    stitches,
    marks: {
      chestY: 1000,
      chestL: X(522),
      chestR: AXIS - X(522),
      hemTop: e,
      hemBottom: e + band,
      pocketTop: P(1253),
      sleeveL: [X(300), 1130],
      sleeveR: [AXIS - X(300), 1130],
      shoulder: [X(478), 812],
    },
  };
}
