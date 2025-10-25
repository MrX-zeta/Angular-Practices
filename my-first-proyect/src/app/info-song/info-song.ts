import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-song',
  templateUrl: './info-song.html',
  styleUrls: ['./info-song.css'],
  standalone: false
})
export class InfoSong implements OnInit{

  constructor(){
    console.log("El componente InfoSong se ha integrado.")
    console.log(this.song)
  }

  ngOnInit(): void {
      console.log(this.song);
      console.log("Las entradas del componente se han creado")
  }

  @Input()
  song: any;

}