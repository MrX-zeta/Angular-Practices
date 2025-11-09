import { Injectable, signal } from '@angular/core';
import { Song } from '../models/song.model';
import { SpotifyPlaylistService } from './spotify-playlist-service';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})

export class MusicPlayerService {
  private _audio: HTMLAudioElement = new Audio();
  private _eventsAttached = false;
  private _audioEventHandlers: { [k: string]: EventListenerOrEventListenerObject } = {};
  private _currentSong = signal<Song | null>(null);
  private _isPlaying = signal<boolean>(false);
  private _progress = signal<number>(0);
  private _duration = signal<number>(0);
  private _currentTime = signal<number>(0);
  private _playlist = signal<Song[]>([]);
  private _currentIndex = signal<number>(0);
  
  readonly currentSong = this._currentSong.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly progress = this._progress.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly currentTime = this._currentTime.asReadonly();
  readonly playlist = this._playlist.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();


  constructor(
    private spotifyPlaylistService: SpotifyPlaylistService,
    private spotifyService: SpotifyService
  ) {
    this.setupAudioEvents();

    console.log(' MusicPlayerService inicializado en modo búsqueda (sin reproducción automática)');
  }

 

  async loadSpotifyPlaylist() {
    try {
      console.log('Cargando canciones de prueba de Spotify...');
      
      const testTracks = await this.spotifyService.getTestTracksWithPreviews();
      
      if (testTracks.length > 0) {
        console.log(` Cargando ${testTracks.length} canciones de prueba con previews`);
        
        const songs: Song[] = testTracks.map((track: any) => ({
          song_name: track.name,
          artist_name: track.artists && track.artists[0] ? track.artists[0].name : 'Artista desconocido',
          song_url: track.preview_url,
          caratula: track.album && track.album.images && track.album.images[0] 
            ? track.album.images[0].url 
            : 'https://via.placeholder.com/300x300/1DB954/ffffff?text=' + encodeURIComponent(track.name)
        }));

        console.log(' Canciones cargadas:');
        songs.forEach((song, index) => {
          console.log(`${index + 1}. ${song.song_name} - ${song.artist_name}`);
          console.log(`   Preview: ${song.song_url}`);
        });

        this._playlist.set(songs);
        if (songs.length > 0) {
          this.loadSong(songs[0]);
          this._currentIndex.set(0);
        }
        return;
      }

      const token = await this.spotifyService.getValidAccessToken();
      
      this.spotifyPlaylistService.getPlaylist(token).subscribe({
        next: (response: any) => {
          console.log('PLAYLIST DE SPOTIFY CARGADA');
          console.log('Nombre de playlist:', response.name);
          console.log('Total de tracks:', response.tracks?.items?.length || 0);
          
          if (response.tracks && response.tracks.items && response.tracks.items.length > 0) {
            const songsWithPreview: Song[] = [];
            
            response.tracks.items
              .filter((item: any) => item.track && item.track.preview_url)
              .forEach((item: any, index: number) => {
                const track = item.track;
                console.log(`Track ${index + 1}: ${track.name} - Preview: `);
                
                const song: Song = {
                  song_name: track.name,
                  artist_name: track.artists && track.artists[0] ? track.artists[0].name : 'Artista desconocido',
                  song_url: track.preview_url,
                  caratula: track.album && track.album.images && track.album.images[0] 
                    ? track.album.images[0].url 
                    : 'https://via.placeholder.com/300x300/1DB954/ffffff?text=' + encodeURIComponent(track.name)
                };
                
                songsWithPreview.push(song);
              });
            
            if (songsWithPreview.length > 0) {
              this._playlist.set(songsWithPreview);
              this.loadSong(songsWithPreview[0]);
              this._currentIndex.set(0);
              console.log('Playlist con previews de Spotify cargada y lista para reproducir');
            } else {
              console.warn('No se encontraron previews, usando playlist local');
              this.loadDefaultPlaylist();
            }
          } else {
            console.warn('No se encontraron tracks, usando playlist local');
            this.loadDefaultPlaylist();
          }
        },
        error: (error) => {
          console.error(' Error cargando playlist de Spotify:', error);
          this.loadDefaultPlaylist();
        }
      });
    } catch (error) {
      console.error('Error obteniendo canciones de Spotify:', error);
      this.loadDefaultPlaylist();
    }
  }

  private loadDefaultPlaylist() {
    console.log('Cargando playlist por defecto (vacía)');
    this._playlist.set([]);
  }

  private setupAudioEvents() {
    if (this._eventsAttached) return;

    this._audioEventHandlers['loadedmetadata'] = () => {
      this._duration.set(this._audio.duration);
      this._progress.set(0);
    };

    this._audioEventHandlers['timeupdate'] = () => {
      const currentTime = this._audio.currentTime;
      const duration = this._audio.duration;
      this._currentTime.set(currentTime);
      if (duration > 0) {
        this._progress.set((currentTime / duration) * 100);
      }
    };

    this._audioEventHandlers['ended'] = () => {
      console.log('Canción terminada - Pasando a la siguiente automáticamente');
      setTimeout(() => {
        console.log('Ejecutando nextSong()...');
        this.nextSong();
      }, 100);
    };

    this._audioEventHandlers['play'] = () => {
      this._isPlaying.set(true);
    };

    this._audioEventHandlers['pause'] = () => {
      this._isPlaying.set(false);
    };

    this._audioEventHandlers['error'] = (error: any) => {
      console.error('Error al cargar el audio:', error);
      console.error('URL que falló:', this._audio.src);
      console.error('Código de error:', this._audio.error?.code);
      console.error('Mensaje de error:', this._audio.error?.message);
      this._isPlaying.set(false);
    };

    this._audioEventHandlers['canplay'] = () => {
      console.log('Audio listo para reproducir:', this._currentSong()?.song_name);
    };

    this._audioEventHandlers['loadstart'] = () => {
      console.log('Iniciando carga de audio...');
    };

    for (const [evt, handler] of Object.entries(this._audioEventHandlers)) {
      this._audio.addEventListener(evt, handler as EventListener);
    }

    this._eventsAttached = true;
  }

  private removeAudioEvents() {
    if (!this._eventsAttached) return;
    for (const [evt, handler] of Object.entries(this._audioEventHandlers)) {
      this._audio.removeEventListener(evt, handler as EventListener);
    }
    this._eventsAttached = false;
    this._audioEventHandlers = {};
  }

  loadSong(song: Song, autoPlay: boolean = false) {
    console.log('=== Cargando canción ===');
    console.log('Nombre:', song.song_name);
    console.log('Artista:', song.artist_name);
    console.log('URL:', song.song_url);
    
    const isSpotifyPreview = song.song_url.includes('scdn.co') || song.song_url.includes('spotify');
    const isLocalFile = song.song_url.startsWith('media/');
    
    if (isSpotifyPreview) {
      console.log('TIPO: Preview de Spotify (30 segundos)');
    } else if (isLocalFile) {
      console.log('TIPO: Archivo local');
    } else {
      console.log('TIPO: Desconocido');
    }
    
    console.log('Auto reproducir:', autoPlay);
    
    if (!this._audio.paused) {
      this._audio.pause();
    }
    
    this._currentSong.set(song);
    this._isPlaying.set(false);
    
    this._audio.src = '';
    this._audio.load();
    
    this._audio.src = song.song_url;
    this._audio.load();
    
    // Event handling centralized in setupAudioEvents() to avoid duplicated listeners.
    // Attempt to autoplay if requested; the browser may block autoplay without user interaction.
    if (autoPlay) {
      this._audio.play().catch(e => {
        console.debug('Autoplay bloqueado o fallo al iniciar reproducción:', e);
      });
    }
  }

  playPause() {
    if (this._isPlaying()) {
      console.log('Pausando audio');
      this._audio.pause();
    } else {
      console.log('Intentando reproducir audio');
      this._audio.play().catch(error => {
        console.error('Error al reproducir:', error);
        console.error('Posible causa: El navegador requiere interacción del usuario');
      });
    }
  }

  selectSong(song: Song) {
    console.log('=== SELECCIÓN MANUAL ===');
    console.log('Canción seleccionada:', song.song_name);
    
    const playlist = this._playlist();
    const songIndex = playlist.findIndex(s => 
      s.song_name === song.song_name && s.artist_name === song.artist_name
    );
    
    if (songIndex !== -1) {
      console.log('Índice encontrado:', songIndex);
      this._currentIndex.set(songIndex);
      this.loadSong(song, true);
    } else {
      console.warn('Canción no encontrada en la playlist');
      this.loadSong(song, true);
    }
  }

  nextSong() {
    const playlist = this._playlist();
    if (playlist.length === 0) {
      console.warn('No hay canciones en la playlist');
      return;
    }
    
    const currentIndex = this._currentIndex();
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextSong = playlist[nextIndex];
    
    console.log(`=== SIGUIENTE CANCIÓN ===`);
    console.log(`Índice actual: ${currentIndex}`);
    console.log(`Próximo índice: ${nextIndex}`);
    console.log(`Próxima canción: ${nextSong.song_name}`);
    
    this._currentIndex.set(nextIndex);
    this.loadSong(nextSong, true);
  }

  previousSong() {
    const playlist = this._playlist();
    if (playlist.length === 0) {
      console.warn('No hay canciones en la playlist');
      return;
    }
    
    const currentIndex = this._currentIndex();
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    const prevSong = playlist[prevIndex];
    
    console.log(`=== CANCIÓN ANTERIOR ===`);
    console.log(`Índice actual: ${currentIndex}`);
    console.log(`Índice anterior: ${prevIndex}`);
    console.log(`Canción anterior: ${prevSong.song_name}`);
    
    this._currentIndex.set(prevIndex);
    this.loadSong(prevSong, true);
  }

  setProgress(value: number) {
    const duration = this._duration();
    if (duration > 0) {
      this._audio.currentTime = (value / 100) * duration;
    }
  }

  cleanup() {
    console.log('MusicPlayerService: cleanup - liberando recursos de audio');

    try {
      if (!this._audio.paused) {
        this._audio.pause();
      }
      this.removeAudioEvents();

      try {
        this._audio.src = '';
        this._audio.load();
      } catch (e) {
        console.warn('Error limpiando src del audio:', e);
      }

      this._currentSong.set(null);
      this._isPlaying.set(false);
      this._progress.set(0);
      this._duration.set(0);
      this._currentTime.set(0);
      this._playlist.set([]);
      this._currentIndex.set(0);
    } catch (err) {
      console.error('Error during MusicPlayerService.cleanup():', err);
    }
  }
}