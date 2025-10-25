import { Component, inject, OnInit } from '@angular/core';
import { MusicPlayerService } from './services/music-player.service';
import { SpotifyService } from './services/spotify.service';
import { ImageService } from './services/image.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.css']
})
export class App {
  private musicService = inject(MusicPlayerService);
  private spotifyService = inject(SpotifyService);
  private imageService = inject(ImageService);
  
  title = 'SoundShock';
  
  currentSong = this.musicService.currentSong;
  isPlaying = this.musicService.isPlaying;
  featuredImages: string[] = [];
  cardsImages: string[] = [];
  userAvatar: string = 'https://via.placeholder.com/32';
  
  constructor() {
    (window as any).musicService = this.musicService;
    (window as any).spotifyService = this.spotifyService;
    console.log('🎵 SoundShock inicializado');
    console.log('🔧 Para probar audio, ejecuta: musicService.testAudio()');
    console.log('🎶 Para probar Spotify login, ejecuta: spotifyService.loginUser()');
  }

  async ngOnInit(): Promise<void> {
    // load a batch of images for the UI
    try {
      const urls = await this.imageService.loadImages(24);
      // populate arrays used by template (guarded by length)
      this.featuredImages = urls.slice(0, 6);
      this.cardsImages = urls.slice(6);
      // pick a random avatar from the loaded images (small size)
      this.userAvatar = this.imageService.getRandomUrl('https://via.placeholder.com/32');
    } catch (err) {
      console.warn('Could not load images', err);
    }
  }

  // Método para probar login de Spotify
  testSpotifyLogin() {
    console.log('🎶 Intentando login de Spotify...');
    this.spotifyService.loginUser();
  }

  // Método para recargar playlist de Spotify
  async reloadSpotifyPlaylist() {
    console.log('🔄 Recargando playlist de Spotify...');
    try {
      // Llamar directamente al método del servicio de música
      await this.musicService.loadSpotifyPlaylist();
      console.log('✅ Playlist recargada exitosamente');
    } catch (error) {
      console.error('❌ Error recargando playlist:', error);
    }
  }

  // Método para usar el código de autorización de Spotify
  async useSpotifyCode() {
    const code = prompt('Pega el código de Spotify aquí (después de "code=" en la URL):');
    if (code) {
      try {
        console.log('🎫 Usando código de Spotify:', code.substring(0, 20) + '...');
        const tokenData = await this.spotifyService.getTokenFromCode(code);
        console.log('✅ Token obtenido:', tokenData);
        alert('¡Token de Spotify guardado! Ahora recarga la playlist.');
      } catch (error) {
        console.error('❌ Error con código Spotify:', error);
        alert('Error: ' + error);
      }
    }
  }

  // Métodos para probar navegación
  testNextSong() {
    console.log('🔄 Probando siguiente canción...');
    this.musicService.nextSong();
  }

  testPreviousSong() {
    console.log('🔄 Probando canción anterior...');
    this.musicService.previousSong();
  }

  // Método para mostrar playlist actual
  showCurrentPlaylist() {
    const playlist = this.musicService.playlist();
    const currentIndex = this.musicService.currentSong();
    console.log('📋 Playlist actual:', playlist);
    console.log('🎵 Canción actual:', currentIndex);
    console.log('📊 Total de canciones:', playlist.length);
    alert(`Playlist: ${playlist.length} canciones. Ver consola para detalles.`);
  }
}
