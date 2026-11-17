/** Parses store prices such as "Rs. 1,500" into whole rupees. */
export function parsePrice(text: string): number {
  const match = /Rs\.\s*([\d,]+)/.exec(text);
  if (!match?.[1]) {
    throw new Error(`Not a price: "${text}"`);
  }
  return Number(match[1].replaceAll(',', ''));
}
