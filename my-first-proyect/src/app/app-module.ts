import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { InfoSong } from './info-song/info-song';
import { MediaControl } from './media-control/media-control';
import { AudioController } from './audio-controller/audio-controller';
import { SongInfo } from './song-info/song-info';
import { Playlist } from './playlist/playlist';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth-interceptor';
import { addAuthHeaderInterceptor } from './interceptors/core/add-auth-header-interceptor';
import { Player } from './player/player';

import { SearchSection } from '../search/search-bar/search-section/search-section';
import { SearchBarModule } from '../search/search-bar/search-bar.module';

@NgModule({
  declarations: [
    App,
    AudioController,
    Player,
    SearchSection,
    InfoSong,
    MediaControl,
    SongInfo,
    Playlist
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    SearchBarModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([authInterceptor, addAuthHeaderInterceptor])
    )
  ],
  bootstrap: [App]
})
export class AppModule { }
