import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-first-proyect');
  title2 = 'exampleAngular';

  nextSongs: any[] = [
    {
      name: 'Song 1',
      artist: 'Artist 1',
      url: 'https://picsum.photos/200/300?random=1'
    }
  ];

  nextSongsQueue: any[] = [
    {
      name: 'Song 2',
      artist: 'Artist 2',
      url: 'https://picsum.photos/200/300?random=2'
    }
  ];

  lastSongs: any[] = [];
  currentSong: any | undefined = undefined;

  changeToLastSong() {
    if (this.lastSongs.length !== 0) {
      if (this.currentSong) {
        this.nextSongsQueue.push(this.currentSong);
      }
      this.currentSong = this.lastSongs.pop();
    }
  }

  changeToNextSong() {
    if (this.nextSongsQueue.length !== 0) {
      if (this.currentSong) {
        this.lastSongs.push(this.currentSong);
      }
      this.currentSong = this.nextSongsQueue.pop();
    }
  }
}
