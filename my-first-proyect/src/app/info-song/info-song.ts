import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-song',
  standalone: false,
  templateUrl: './info-song.html',
  styleUrl: './info-song.css'
})
export class InfoSong {
  @Input({ required: true })
    song: any;
}
