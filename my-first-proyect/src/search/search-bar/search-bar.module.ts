import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBar } from './search-bar';

@NgModule({
  declarations: [SearchBar],
  imports: [CommonModule, FormsModule],
  exports: [SearchBar]
})
export class SearchBarModule {}
