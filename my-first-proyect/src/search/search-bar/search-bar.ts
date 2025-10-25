import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: false,
  template: `
    <div class="search-bar">
      <input [(ngModel)]="query" placeholder="Buscar canciones, artistas o álbumes" />
      <button (click)="doSearch()">Buscar</button>
    </div>
  `
})
export class SearchBar {
  query = '';
  @Output() searchResults = new EventEmitter<any[]>();
  @Output() searchStart = new EventEmitter<void>();

  constructor() {}

  doSearch() {
    this.searchStart.emit();
    this.searchResults.emit([]);
  }
}
