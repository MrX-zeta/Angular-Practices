import { HttpInterceptorFn} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { CookieStorageService } from '../../services/general/cookie-storage-service';

export const addAuthHeaderInterceptor: HttpInterceptorFn = (req, next) => {

  const _cookieStorage: CookieStorageService = inject(CookieStorageService);

  if(environment.spotify?.clientId && !req.url.includes('api.spotify.com')) {
    return next(req);
  }

  const accessToken = _cookieStorage.getCookieValue('access_token');
  
  if (!accessToken) {
    return next(req);
  }

  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${accessToken}`)
  });

  return next(newReq);
};
