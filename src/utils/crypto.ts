export function genRandomString(length: number, chars: string) {
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  return Array.from(randomArray, (val) => chars[val % chars.length]).join('');
}
