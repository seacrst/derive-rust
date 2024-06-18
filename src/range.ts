

export function range(start: number, end: number = 0): number[] {
  const r: number[] = [];

  if (start < end) {
      for (let i = start; i < end; i += 1) {
        r.push(i);
      }
      return r;
  } else {
      for (let i = start; i > end; i -= 1) {
        r.push(i);
      }

      return r;
  }
}

export function rangeInc(start: number, end: number): number[] {
  return range(start, start < end ? end + 1 : end - 1);
}

export function rangeChars(start: string, end: string, str: string): string[] {

  if (start.length === 0 && end.length === 0) {
    return Array.from(str);
  }

  if (!(str.includes(start) && str.includes(end))) {
    return Array.from(str);
  }

  const startIdx = str.indexOf(start);
  const endIdx = str.indexOf(end);

  if (start.length > 0 && end.length === 0) {
    return Array.from(str.slice(startIdx));
  } else 

  if (end.length > 0 && start.length === 0) {
    return rangeChars(end, "", Array.from(str).reverse().join(""))
      .reverse()
      .slice(0, -1);
  } else {
    return Array.from(str.slice(startIdx, endIdx));
  }
}

export function rangeCharsInc(start: string, end: string, str: string): string[] {
  if (start.length === 0 && end.length === 0) {
    return Array.from(str);
  }

  if (!(str.includes(start) && str.includes(end))) {
    return Array.from(str);
  }

  const startIdx = str.indexOf(start);
  const endIdx = str.indexOf(end);

  if (start.length > 0 && end.length === 0) {
    return Array.from(str.slice(startIdx));
  } else 

  if (end.length > 0 && start.length === 0) {
    return rangeChars(end, "", Array.from(str).reverse().join(""))
      .reverse()
      .slice();
  } else {
    return Array.from(str.slice(startIdx, endIdx + 1));
  }
}

export function rangeCharsRev(start: string, end: string, str: string): string[] {
  return rangeChars(end, start, Array.from(str).reverse().join(""));
}

export function rangeCharsRevInc(start: string, end: string, str: string): string[] {
  return rangeChars(end, str.at(str.indexOf(start) - 1) || end, Array.from(str).reverse().join(""))
}