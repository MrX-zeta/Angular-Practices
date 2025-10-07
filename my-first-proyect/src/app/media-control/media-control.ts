import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-media-control',
  standalone: false,
  templateUrl: './media-control.html',
  styleUrl: './media-control.css'
})
export class MediaControl {
  @Input() song: any;
    isPlaying: boolean = false;

    @Output() requestNextSong = new EventEmitter<void>();
    @Output() requestLastSong = new EventEmitter<void>();

    nextSong() {
        this.requestNextSong.emit();
    }

    lastSong() {
        this.requestLastSong.emit();
    }
}
