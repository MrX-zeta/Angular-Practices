import { Component, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-media-control',
  standalone: false,
  templateUrl: './media-control.html',
  styleUrl: './media-control.css'
})
export class MediaControl implements OnInit{

  song: any;
  isPlaying:boolean = false;
  requestSong = output<boolean>();

  constructor(){
    
  }

  ngOnInit(): void {
      console.log("")
  }

  nextSong(){
    this.requestSong.emit(true);
  }

  lastSong(){
    this.requestSong.emit(false);
  }

}