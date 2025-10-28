import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyLoginService {

  constructor(
    private _http:HttpClient
  ) {  }

  getToken(): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'client_credentials');

  const credentials = `${environment.spotify.clientId}:${environment.spotify.clientSecret}`;
  const encodedCredentials = btoa(credentials);

    return this._http.post<any>(
      environment.spotify.tokenUrl,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCredentials}`
        }
      }
    );

  }
}
