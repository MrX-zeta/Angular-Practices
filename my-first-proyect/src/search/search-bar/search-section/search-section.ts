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

  onSearchResults(results: any[]): void {
    this.searchResults = results;
    this.isLoading = false;
    console.log('🔍 Resultados recibidos:', this.searchResults.length);
  }

  onSearchStart(): void {
    this.isLoading = true;
  }
}
