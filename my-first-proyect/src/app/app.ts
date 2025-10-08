import { AfterContentChecked, AfterContentInit, Component, OnInit, signal } from '@angular/core';
import { Song } from './interfaces/song';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App{
  protected readonly title = signal('EXAMPLE_APP');

  constructor(){
    this.actualSong = this.getNextSongFromPlaylist();
  }

nextSongs: Song[] = [
   {
      name: "Amar como tú",
      artist: "Steven",
      url_cover: "https://picsum.photos/200",
      url_media: ""
  },
   {
      name: "Science",
      artist: "Arctic Monkeys",
      url_cover: "https://picsum.photos/200",
      url_media: ""
  },
  {
      name: "Surf",
      artist: "Mac Miller", 
      url_cover: "https://picsum.photos/200",
      url_media: ""
  },
]

lastSongs: Song[] = []
actualSong: Song;


 changeSong(value: boolean){
  if(value){
      if(this.nextSongs.length==0)
        return;

      this.lastSongs.push(this.actualSong);
      this.actualSong = this.getNextSongFromPlaylist();
    } else {
      if(this.lastSongs.length == 0)
        return;

      this.nextSongs.push(this.actualSong);
      this.actualSong = this.getLastSongFromPlaylist();
    }
  if(this.actualSong != undefined){
    alert("No se ha podido cargar la canción.")
  }
 }

 getNextSongFromPlaylist(): Song{
  let possible_song = this.nextSongs.pop()
  if(possible_song !== undefined)
    return possible_song;
  else{
    return{
      name: "Amar como tú",
      artist: "Steven",
      url_cover: "https://picsum.photos/200",
      url_media: ""
    }
  }
 }

 getLastSongFromPlaylist(): Song{
  let possible_song = this.lastSongs.pop()
  if(possible_song !== undefined)
    return possible_song;
  else{
    return{
      name: "Amar como tú",
      artist: "Steven",
      url_cover: "https://picsum.photos/200",
      url_media: ""
    }
  }
  }
}