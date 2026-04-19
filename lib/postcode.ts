export function normalisePostcode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, " ").replace(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/, "$1 $2");
}

export function getPostcodeDistrict(postcode: string): string | null {
  const n = normalisePostcode(postcode);
  const m = n.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(?:\s|$)/);
  return m ? m[1] : null;
}

export function getPostcodeSector(postcode: string): string | null {
  const n = normalisePostcode(postcode);
  const m = n.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s+(\d)/);
  return m ? `${m[1]} ${m[2]}` : null;
}

export function isValidOutwardOrFull(postcode: string): boolean {
  const n = normalisePostcode(postcode);
  return /^[A-Z]{1,2}\d{1,2}[A-Z]?(\s+\d[A-Z]{2})?$/.test(n);
}
