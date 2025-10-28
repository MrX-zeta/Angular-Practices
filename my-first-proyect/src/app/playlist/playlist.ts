import { Component, Input, Signal } from '@angular/core';
import { Track } from '../interfaces/track';
import { Image } from '../interfaces/image';

@Component({
  selector: 'app-playlist',
  standalone: false,
  templateUrl: './playlist.html',
  styleUrls: ['./playlist.css']
})
export class Playlist {
  @Input() playlist!: Signal<Track[]>;
  @Input() cover!: Signal<Image>;
}
