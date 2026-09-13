const small = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function wholeNumber(value: number): string {
  if (value < 20) return small[value];
  if (value < 100)
    return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${small[value % 10]}` : ''}`;
  for (const [unit, name] of [
    [1_000_000_000, 'billion'],
    [1_000_000, 'million'],
    [1000, 'thousand'],
    [100, 'hundred'],
  ] as const) {
    if (value >= unit)
      return `${wholeNumber(Math.floor(value / unit))} ${name}${value % unit ? ` ${wholeNumber(value % unit)}` : ''}`;
  }
  return '';
}

/** Send unambiguous spoken English to the generative voice, never raw numerals. */
export function spokenText(text: string): string {
  const fractionPieces: Record<string, string> = {
    '4ths': 'fourths',
    '6ths': 'sixths',
    '8ths': 'eighths',
    '10ths': 'tenths',
    '12ths': 'twelfths',
  };
  return text
    .replace(/\b(?:4|6|8|10|12)ths\b/g, (word) => fractionPieces[word])
    .replace(/\b\d+(?:\.\d+)?\b/g, (number) => {
      const [whole, decimal] = number.split('.');
      const words = Number.isSafeInteger(Number(whole))
        ? wholeNumber(Number(whole))
        : [...whole].map((digit) => small[Number(digit)]).join(' ');
      return decimal === undefined
        ? words
        : `${words} point ${[...decimal].map((digit) => small[Number(digit)]).join(' ')}`;
    })
    .replace(
      /(^|[.!?]\s+)([a-z])/g,
      (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`,
    );
}
