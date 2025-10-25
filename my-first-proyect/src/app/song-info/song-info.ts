import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../interfaces/track';
import { Image } from '../interfaces/image';

@Component({
  selector: 'app-song-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-info.html',
  styleUrls: ['./song-info.css']
})
export class SongInfo {
  @Input() song?: Track | null;
  @Input() cover?: Image | null;
  @Input() displayMode?: string;

  displayModeClass(): string {
    return this.displayMode ?? '';
  }
}
