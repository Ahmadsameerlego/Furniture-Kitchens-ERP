// Code 39 barcode as an SVG string. Each character is 9 elements (bar, space, bar...),
// three of them wide; characters are separated by one narrow space and the whole
// code is framed by the "*" start/stop character.

const PATTERNS: Record<string, string> = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
  'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw', 'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn',
  'F': 'nnwnwwnnn', 'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww', 'O': 'wnnnwnnwn',
  'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn', 'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn',
  'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw', 'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn',
  'Z': 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn'
};

/** Keep only characters Code 39 can encode. */
export const toCode39Text = (value: string) =>
  value.toUpperCase().replace(/[^0-9A-Z\-. ]/g, '-');

export function code39Svg(value: string, opts: { height?: number; narrow?: number } = {}): string {
  const narrow = opts.narrow ?? 1;
  const wide = narrow * 3;
  const height = opts.height ?? 34;
  const text = `*${toCode39Text(value)}*`;
  let x = 0;
  const bars: string[] = [];
  [...text].forEach((ch, ci) => {
    const pattern = PATTERNS[ch] || PATTERNS['-'];
    [...pattern].forEach((el, i) => {
      const w = el === 'w' ? wide : narrow;
      if (i % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${w}" height="${height}"/>`);
      x += w;
    });
    if (ci < text.length - 1) x += narrow;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} ${height}" preserveAspectRatio="none" shape-rendering="crispEdges"><g fill="#000">${bars.join('')}</g></svg>`;
}
