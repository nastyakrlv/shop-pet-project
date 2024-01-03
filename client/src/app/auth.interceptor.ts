import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { LocalStorageKeys } from './types/localstorage-keys.enum';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next:
  HttpHandlerFn) => {
  const userToken = localStorage.getItem(LocalStorageKeys.USER_TOKEN);
  const modifiedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${userToken}`),
  });

  return next(modifiedReq);
};