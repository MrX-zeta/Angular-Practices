import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SimpleCookieService {
  constructor() {}

  get(name: string): string {
    if (typeof document === 'undefined') return '';
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const c of cookies) {
      const [k, ...vParts] = c.split('=');
      const kTrim = decodeURIComponent(k);
      if (kTrim === name) {
        return decodeURIComponent(vParts.join('='));
      }
    }
    return '';
  }

  set(name: string, value: string, expires?: number | Date): void {
    if (typeof document === 'undefined') return;
    let cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; path=/';
    if (expires !== undefined) {
      if (typeof expires === 'number') {
        const d = new Date();
        d.setTime(d.getTime() + expires * 24 * 60 * 60 * 1000);
        cookie += '; expires=' + d.toUTCString();
      } else if (expires instanceof Date) {
        cookie += '; expires=' + expires.toUTCString();
      }
    }
    document.cookie = cookie;
  }

  delete(name: string): void {
    if (typeof document === 'undefined') return;
    this.set(name, '', new Date(0));
  }

  check(name: string): boolean {
    return this.get(name) !== '';
  }
}
