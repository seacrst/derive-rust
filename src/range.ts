

export function range(start: number, end: number): number[] {
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
    return start.length > 0 && end.length > 0 ? Array.from(str.slice(str.indexOf(start), str.indexOf(end))) : Array.from(start);
  }
  
  export function rangeCharsInc(start: string, end: string, str: string): string[] {
    return rangeChars(start, str.at(str.indexOf(end) + 1) || end, str);
  }
  
  export function rangeCharsRev(start: string, end: string, str: string): string[] {
    return rangeChars(str.at(str.indexOf(start) + 1) || start, str.at(str.indexOf(end) + 1) || end, str).reverse();
  }
  
  export function rangeCharsRevInc(start: string, end: string, str: string): string[] {
    return rangeChars(start, str.at(str.indexOf(end) + 1) || end, str).reverse()
  }