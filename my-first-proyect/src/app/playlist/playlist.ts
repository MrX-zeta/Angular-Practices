import { Component, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../interfaces/track';
import { Image } from '../interfaces/image';
import { SongInfo } from '../song-info/song-info';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, SongInfo],
  templateUrl: './playlist.html',
  styleUrls: ['./playlist.css']
})
export class Playlist {
  // The parent passes signals (callable) for playlist and cover; type as Signal so template can call them
  @Input() playlist!: Signal<Track[]>;
  @Input() cover!: Signal<Image>;
}
