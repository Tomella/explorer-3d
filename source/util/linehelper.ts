export function isDataLine(line: string): boolean {
   line = line.trim();
   return isNonEmpty(line) && line.indexOf("#") !== 0;
}

export function isNonEmpty(line: string): boolean {
   return line.trim().length !== 0;
}
