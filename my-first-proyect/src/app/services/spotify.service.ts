import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class SpotifyService {
  private clientId = environment.spotify.clientId;
  private clientSecret = environment.spotify.clientSecret;
  
  private redirectUri = environment.spotify.redirectUri;

  constructor(private http: HttpClient) {}
  
  async getAccessToken(): Promise<string> {
    console.log('Obteniendo access token...');
    
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No se recibió access_token en la respuesta');
      }
      
      console.log(' Token obtenido exitosamente');
      console.log('🕐 Expira en:', data.expires_in, 'segundos');
      
      const expiresAt = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
      
      return data.access_token;
    } catch (error) {
      console.error(' Error obteniendo access token:', error);
      throw error;
    }
  }

  async getValidAccessToken(): Promise<string> {
    console.log(' Verificando token de acceso...');

    const savedToken = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_token_expires_at');
    
    if (savedToken && expiresAt) {
      const now = Date.now();
      const expiration = parseInt(expiresAt);
      
      if (now < expiration - 300000) {
        console.log(' Usando token guardado válido');
        return savedToken;
      } else {
        console.log('⚠️ Token expirado, obteniendo uno nuevo');
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires_at');
      }
    }
    
    console.log('🎫 Obteniendo nuevo token client credentials');
    return await this.getAccessToken();
  }

  async searchTracks(query: string): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.tracks?.items || [];
    } catch (error) {
      console.error(' Error buscando tracks:', error);
      throw error;
    }
  }

  async getTestTracksWithPreviews(): Promise<any[]> {
    try {
      console.log('🎵 Buscando canciones de prueba con previews...');
      
      const testQueries = [
        'Shape of You Ed Sheeran',
        'Blinding Lights The Weeknd',
        'Bad Guy Billie Eilish',
        'Bohemian Rhapsody Queen',
        'Hotel California Eagles',
        'Imagine Dragons Believer',
        'Dua Lipa Levitating',
        'The Chainsmokers Closer',
        'Post Malone Circles',
        'Ariana Grande positions'
      ];

      const allTracks = [];
      
      for (const query of testQueries) {
        try {
          const tracks = await this.searchTracks(query);
          const tracksWithPreview = tracks.filter((track: any) => track.preview_url);
          if (tracksWithPreview.length > 0) {
            allTracks.push(tracksWithPreview[0]);
            console.log(` Encontrada con preview: ${tracksWithPreview[0].name} - ${tracksWithPreview[0].artists[0].name}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Error buscando: ${query}`, error);
        }
      }

      console.log(`🎵 Total de canciones con preview encontradas: ${allTracks.length}`);
      return allTracks;
    } catch (error) {
      console.error(' Error obteniendo tracks de prueba:', error);
      return [];
    }
  }

  async getUserPlaylists(): Promise<any> {
    throw new Error('getUserPlaylists requires user authentication (not implemented)');
  }
}