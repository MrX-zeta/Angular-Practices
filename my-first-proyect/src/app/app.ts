import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MusicPlayerService } from './services/music-player.service';
import { SpotifyService } from './services/spotify.service';
import { ImageService } from './services/image.service';
import { SpotifyLoginService } from './services/spotify-api/spotify-login-service';
import { CookieStorageService } from './services/general/cookie-storage-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.css']
})

export class App implements OnInit {
  private musicService = inject(MusicPlayerService);
  private spotifyService = inject(SpotifyService);
  private imageService = inject(ImageService);
  private _spotifyLogin = inject(SpotifyLoginService);
  private _cookieStorage = inject(CookieStorageService);
  private router = inject(Router);
  
  title = 'SoundShock';
  
  activeSection = signal<'home' | 'search'>('home');
  
  currentSong = this.musicService.currentSong;
  isPlaying = this.musicService.isPlaying;
  featuredImages: string[] = [];
  cardsImages: string[] = [];
  userAvatar: string = 'https://via.placeholder.com/32';
  progress = this.musicService.progress;
  duration = this.musicService.duration;
  currentTime = this.musicService.currentTime;

  showSection(section: 'home' | 'search'): void {
    this.activeSection.set(section);
  }

  showAndNavigate(section: 'home' | 'search'): void {
    this.showSection(section);
    try {
      this.router.navigate([section]);
    } catch (err) {
      console.warn(' Error navegando:', err);
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      const hasToken = this._cookieStorage.checkCookie?.('access_token') || 
                       !!this._cookieStorage.getCookieValue?.('access_token');
      
      if (!hasToken) {
        this._spotifyLogin.getToken().subscribe({
          next: () => console.log('Token obtenido exitosamente'),
          error: (err) => console.error('Error obteniendo token:', err)
        });
      }
    } catch (err) {
      console.warn('Error verificando token:', err);
    }

    try {
      const urls = await this.imageService.loadImages(24);
      this.featuredImages = urls.slice(0, 6);
      this.cardsImages = urls.slice(6);
      this.userAvatar = this.imageService.getRandomUrl('https://via.placeholder.com/32');
    } catch (err) {
      console.warn('Error cargando imágenes:', err);
    }

    try {
      const path = this.router.url.split('?')[0] || '';
      if (path.includes('/search')) {
        this.activeSection.set('search');
      } else {
        this.activeSection.set('home');
      }
    } catch (err) {}
  }

  playPause(): void {
    this.musicService.playPause();
  }

  formatTime(): string {
    const time = this.currentTime();
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDuration(): string {
    const time = this.duration();
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  seek(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width)) * 100;
    
    if (typeof this.musicService.setProgress === 'function') {
      this.musicService.setProgress(pct);
    }
  }

  startSeek(event: PointerEvent): void {
    event.preventDefault();
    const bar = event.currentTarget as HTMLElement;

    const moveHandler = (e: PointerEvent) => {
      const rect = bar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width)) * 100;
      
      if (typeof this.musicService.setProgress === 'function') {
        this.musicService.setProgress(pct);
      }
    };

    const upHandler = (e: PointerEvent) => {
      moveHandler(e);
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
      bar.releasePointerCapture?.(e.pointerId);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
    
    try {
      bar.setPointerCapture?.(event.pointerId);
    } catch (err) {
      console.warn('No se pudo capturar el pointer:', err);
    }
  }
}
