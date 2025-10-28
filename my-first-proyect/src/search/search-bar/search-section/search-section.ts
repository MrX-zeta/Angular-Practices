import { Component } from '@angular/core';

@Component({
  selector: 'app-search-section',
  standalone: false,
  templateUrl: './search-section.html',
  styleUrls: ['./search-section.css']
})
export class SearchSection {
  searchResults: any[] = [];
  isLoading = false;
  hasSearched = false;

  onSearchResults(results: any[]): void {
    this.searchResults = results;
    this.isLoading = false;
    this.hasSearched = true;
    console.log('Resultados recibidos:', this.searchResults.length);
  }

  onSearchStart(): void {
    this.isLoading = true;
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatReleaseDate(date: string): string {
    if (!date) return 'Desconocido';
    
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    
    if (date.length === 4) {
      return year.toString();
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short'
    };
    
    if (date.split('-').length === 3) {
      options.day = 'numeric';
    }
    
    return dateObj.toLocaleDateString('es-ES', options);
  }
}
