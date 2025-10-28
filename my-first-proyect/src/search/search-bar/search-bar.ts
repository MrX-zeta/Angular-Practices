import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../../app/services/spotify.service';

@Component({
  selector: 'app-search-bar',
  standalone: false,
  template: `
    <div class="search-bar">
      <div class="search-input-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          [(ngModel)]="query" 
          placeholder="Buscar canciones, artistas o álbumes..." 
          (keyup.enter)="doSearch()"
          class="search-input" />
        <button 
          (click)="doSearch()" 
          [disabled]="!query.trim() || isSearching"
          class="search-button">
          {{ isSearching ? 'Buscando...' : 'Buscar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .search-bar {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-input-container {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 25px;
      padding: 8px 16px;
      position: relative;
    }

    .search-icon {
      color: #ccc;
      margin-right: 12px;
      font-size: 1rem;
    }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: #fff;
      font-size: 1rem;
      padding: 8px 0;
    }

    .search-input::placeholder {
      color: #ccc;
    }

    .search-button {
      background-color: #1DB954;
      border: none;
      border-radius: 20px;
      color: white;
      padding: 8px 16px;
      font-size: 0.9rem;
      cursor: pointer;
      margin-left: 12px;
      transition: background-color 0.3s ease;
    }

    .search-button:hover:not(:disabled) {
      background-color: #1ed760;
    }

    .search-button:disabled {
      background-color: #666;
      cursor: not-allowed;
    }
  `]
})
export class SearchBar {
  query = '';
  isSearching = false;
  @Output() searchResults = new EventEmitter<any[]>();
  @Output() searchStart = new EventEmitter<void>();

  private spotifyService = inject(SpotifyService);

  constructor() {}

  async doSearch() {
    if (this.query.trim()) {
      console.log(' Buscando en Spotify:', this.query);
      this.isSearching = true;
      this.searchStart.emit();
      
      try {
        const tracks = await this.spotifyService.searchTracks(this.query);
        console.log(' Resultados encontrados:', tracks.length);
        this.searchResults.emit(tracks);
      } catch (error) {
        console.error(' Error en búsqueda:', error);
        this.searchResults.emit([]);
      } finally {
        this.isSearching = false;
      }
    }
  }
}
