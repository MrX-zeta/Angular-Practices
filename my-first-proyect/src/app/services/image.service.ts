import { Injectable } from '@angular/core';

export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private images: PicsumImage[] = [];

  constructor() {}

  async loadImages(limit = 20): Promise<string[]> {
    try {
      const resp = await fetch(`https://picsum.photos/v2/list?limit=${limit}`);
      if (!resp.ok) return [];
      const data: PicsumImage[] = await resp.json();
      this.images = data;
      return data.map(i => `https://picsum.photos/id/${i.id}/600/600`);
    } catch (err) {
      console.error('Error loading images', err);
      return [];
    }
  }

  getImageUrl(index: number, fallback = 'https://via.placeholder.com/160'): string {
    if (this.images && this.images.length > 0) {
      const i = this.images[index % this.images.length];
      return `https://picsum.photos/id/${i.id}/600/600`;
    }
    return fallback;
  }

  getRandomUrl(fallback = 'https://via.placeholder.com/160'): string {
    if (this.images && this.images.length > 0) {
      const i = this.images[Math.floor(Math.random() * this.images.length)];
      return `https://picsum.photos/id/${i.id}/600/600`;
    }
    return fallback;
  }
}
