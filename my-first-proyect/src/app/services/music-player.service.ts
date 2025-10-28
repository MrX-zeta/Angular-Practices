import { Injectable, signal } from '@angular/core';
import { Song } from '../models/song.model';
import { SpotifyPlaylistService } from './spotify-playlist-service';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  private _audio: HTMLAudioElement = new Audio();
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

  private defaultSongs: Song[] = [];

  constructor(
    private spotifyPlaylistService: SpotifyPlaylistService,
    private spotifyService: SpotifyService
  ) {
    this.setupAudioEvents();
    
    this._audio.volume = 1.0;
    this._audio.muted = false;
    console.log('🔊 Audio configurado - Volumen:', this._audio.volume, 'Muted:', this._audio.muted);
    
    console.log(' MusicPlayerService inicializado en modo búsqueda (sin reproducción automática)');
  }

  private getRandomLocalSong(): string {
    const randomIndex = Math.floor(Math.random() * this.defaultSongs.length);
    return this.defaultSongs[randomIndex].song_url;
  }

  async loadSpotifyPlaylist() {
    try {
      console.log('🎵 Cargando canciones de prueba de Spotify...');
      
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

        console.log('🎵 Canciones cargadas:');
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
          console.log('=== PLAYLIST DE SPOTIFY CARGADA ===');
          console.log('Nombre de playlist:', response.name);
          console.log('Total de tracks:', response.tracks?.items?.length || 0);
          
          if (response.tracks && response.tracks.items && response.tracks.items.length > 0) {
            const songsWithPreview: Song[] = [];
            
            response.tracks.items
              .filter((item: any) => item.track && item.track.preview_url)
              .forEach((item: any, index: number) => {
                const track = item.track;
                console.log(`🎵 Track ${index + 1}: ${track.name} - Preview: `);
                
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
              console.log('🎵 Playlist con previews de Spotify cargada y lista para reproducir');
            } else {
              console.warn('⚠️ No se encontraron previews, usando playlist local');
              this.loadDefaultPlaylist();
            }
          } else {
            console.warn('⚠️ No se encontraron tracks, usando playlist local');
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
    console.log('Cargando playlist por defecto');
    this._playlist.set(this.defaultSongs);
    
    if (this.defaultSongs.length > 0) {
      this.loadSong(this.defaultSongs[0]);
      this._currentIndex.set(0);
    }
  }

  private setupAudioEvents() {
    this._audio.addEventListener('loadedmetadata', () => {
      this._duration.set(this._audio.duration);
      this._progress.set(0);
    });

    this._audio.addEventListener('timeupdate', () => {
      const currentTime = this._audio.currentTime;
      const duration = this._audio.duration;
      
      this._currentTime.set(currentTime);
      if (duration > 0) {
        this._progress.set((currentTime / duration) * 100);
      }
    });

    this._audio.addEventListener('ended', () => {
      console.log('🎵 Canción terminada - Pasando a la siguiente automáticamente');
      setTimeout(() => {
        console.log('⏭️ Ejecutando nextSong()...');
        this.nextSong();
      }, 100);
    });

    this._audio.addEventListener('play', () => {
      this._isPlaying.set(true);
    });

    this._audio.addEventListener('pause', () => {
      this._isPlaying.set(false);
    });

    this._audio.addEventListener('error', (error) => {
      console.error('Error al cargar el audio:', error);
      console.error('URL que falló:', this._audio.src);
      console.error('Código de error:', this._audio.error?.code);
      console.error('Mensaje de error:', this._audio.error?.message);
      this._isPlaying.set(false);
    });

    this._audio.addEventListener('canplay', () => {
      console.log('Audio listo para reproducir:', this._currentSong()?.song_name);
    });

    this._audio.addEventListener('loadstart', () => {
      console.log('Iniciando carga de audio...');
    });
  }

  loadSong(song: Song, autoPlay: boolean = false) {
    console.log('=== Cargando canción ===');
    console.log('Nombre:', song.song_name);
    console.log('Artista:', song.artist_name);
    console.log('URL:', song.song_url);
    
    const isSpotifyPreview = song.song_url.includes('scdn.co') || song.song_url.includes('spotify');
    const isLocalFile = song.song_url.startsWith('media/');
    
    if (isSpotifyPreview) {
      console.log('🎵 TIPO: Preview de Spotify (30 segundos)');
    } else if (isLocalFile) {
      console.log('📁 TIPO: Archivo local');
    } else {
      console.log('❓ TIPO: Desconocido');
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
    
    const onLoadedMetadata = () => {
      this._duration.set(this._audio.duration);
      console.log('Duración cargada:', this._audio.duration);
      this._audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
    
    const onCanPlay = () => {
      console.log('Audio listo para reproducir');
      if (autoPlay) {
        this._audio.play().then(() => {
          console.log('Reproducción iniciada exitosamente');
        }).catch(e => {
          console.error('Error reproduciendo audio:', e);
        });
      }
      this._audio.removeEventListener('canplay', onCanPlay);
    };
    
    const onError = (e: any) => {
      console.error('=== ERROR CARGANDO AUDIO ===');
      console.error('URL problemática:', song.song_url);
      console.error('Error details:', e);
      console.error('Audio error code:', this._audio.error?.code);
      console.error('Audio error message:', this._audio.error?.message);
      this._audio.removeEventListener('error', onError);
    };
    
    this._audio.addEventListener('loadedmetadata', onLoadedMetadata);
    this._audio.addEventListener('canplay', onCanPlay);
    this._audio.addEventListener('error', onError);
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

  addToPlaylist(song: Song) {
    this._playlist.update(songs => [...songs, song]);
  }

  removeFromPlaylist(index: number) {
    this._playlist.update(songs => songs.filter((_, i) => i !== index));
  }

  getSongs(): Song[] {
    return [...this._playlist()];
  }
  
  testAudio() {
    console.log(' DIAGNÓSTICO DE AUDIO');
    console.log('Estado del audio:', {
      src: this._audio.src,
      paused: this._audio.paused,
      currentTime: this._audio.currentTime,
      duration: this._audio.duration,
      volume: this._audio.volume,
      muted: this._audio.muted,
      readyState: this._audio.readyState,
      networkState: this._audio.networkState
    });
    
    const testUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    console.log('🎵 Probando URL:', testUrl);
    
    this._audio.src = testUrl;
    this._audio.volume = 1.0;
    this._audio.muted = false;
    this._audio.load();
    
    this._audio.addEventListener('canplay', () => {
      console.log(' Audio de prueba listo');
      this._audio.play().then(() => {
        console.log(' Audio de prueba reproduciendo - ¿Escuchas una campana?');
      }).catch(error => {
        console.log(' Error reproduciendo audio de prueba:', error);
      });
    }, { once: true });
    
    this._audio.addEventListener('error', (e) => {
      console.log(' Error en audio de prueba:', e);
    }, { once: true });
  }

  forceAudioConfig() {
    console.log('🔧 Forzando configuración de audio...');
    
    this._audio.volume = 1.0;
    this._audio.muted = false;
    
    console.log('🔊 Volumen:', this._audio.volume);
    console.log('🔇 Muted:', this._audio.muted);
    
    const currentSong = this._currentSong();
    if (currentSong) {
      console.log(' Reiniciando canción actual...');
      this.loadSong(currentSong, true);
    }
  }

  advancedAudioCheck() {
    console.log(' === VERIFICACIÓN AVANZADA DE AUDIO ===');
    
    console.log('📊 Estado del elemento audio:');
    console.log('  - src:', this._audio.src);
    console.log('  - currentSrc:', this._audio.currentSrc);
    console.log('  - paused:', this._audio.paused);
    console.log('  - ended:', this._audio.ended);
    console.log('  - volume:', this._audio.volume);
    console.log('  - muted:', this._audio.muted);
    console.log('  - currentTime:', this._audio.currentTime);
    console.log('  - duration:', this._audio.duration);
    console.log('  - readyState:', this._audio.readyState, '(0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)');
    console.log('  - networkState:', this._audio.networkState, '(0=EMPTY, 1=IDLE, 2=LOADING, 3=NO_SOURCE)');
    console.log('  - error:', this._audio.error);
    
    console.log('  - error:', this._audio.error);
    
    console.log(' Verificando AudioContext del navegador...');
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log(' AudioContext estado:', audioContext.state);
      console.log(' AudioContext sampleRate:', audioContext.sampleRate);
      
      if (audioContext.state === 'suspended') {
        console.log('⚠️ AudioContext está suspendido - puede requerir interacción del usuario');
        audioContext.resume().then(() => {
          console.log(' AudioContext reanudado');
        }).catch(e => {
          console.log(' Error reanudando AudioContext:', e);
        });
      }
    } catch (e) {
      console.log(' Error creando AudioContext:', e);
      console.log(' Error creando AudioContext:', e);
    }
    
    console.log(' Intentando reproducción forzada...');
    const forcePlay = async () => {
      try {
        this._audio.volume = 1.0;
        this._audio.muted = false;
        
        console.log('⏯️ Ejecutando play()...');
        await this._audio.play();
        console.log(' play() ejecutado exitosamente');
        
        setTimeout(() => {
          console.log('📊 Estado después de play():');
          console.log('  - paused:', this._audio.paused);
          console.log('  - currentTime:', this._audio.currentTime);
          console.log('  - duration:', this._audio.duration);
          console.log('  - volume:', this._audio.volume);
          console.log('  - muted:', this._audio.muted);
        }, 1000);
        
      } catch (error) {
        console.log(' Error en play():', error);
        console.log('💡 Esto puede indicar que el navegador bloqueó la reproducción automática');
      }
    };
    
    forcePlay();
    
    return {
      audioElement: this._audio,
      src: this._audio.src,
      volume: this._audio.volume,
      muted: this._audio.muted,
      paused: this._audio.paused,
      readyState: this._audio.readyState,
      networkState: this._audio.networkState
    };
  }
}