import { Component, computed, Input, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-song',
  standalone: false,
  templateUrl: './info-song.html',
  styleUrl: './info-song.css'
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

  @Input({required: true})
    song:any;

}