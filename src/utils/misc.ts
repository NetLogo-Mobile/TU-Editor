/** GenerateObjectID: Generate a random object ID. */
export function GenerateObjectID() {
    return NumberToHex(Date.now() / 1000) + ' '.repeat(16).replace(/./g, () => NumberToHex(Math.random() * 16));
}
  
/** NumberToHex: Convert a number to hex. */
export function NumberToHex(Value: number) {
    return Math.floor(Value).toString(16);
}
  