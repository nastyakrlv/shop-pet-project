import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { IUser } from '../types/user.interface';
import { API_URL } from '../constants';
import { LocalStorageKeys } from '../types/localstorage-keys.enum';
import { IToken } from '../types/token.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient) { }

  public singUp(loginData: IUser): Observable<IToken> {
    return this._http.post<IToken>(API_URL + 'user/registration', loginData).pipe(
      tap((response: IToken) => {
        const tokenStr = response.token;
        localStorage.setItem(LocalStorageKeys.USER_TOKEN, tokenStr);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  public singIn(loginData: IUser): Observable<IToken> {
    return this._http.post<IToken>(API_URL + 'user/login', loginData).pipe(
      tap((response: IToken) => {
        const tokenStr = response.token;
        localStorage.setItem(LocalStorageKeys.USER_TOKEN, tokenStr);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  public isAuthenticated(): boolean {
    const token: string | null = localStorage.getItem(LocalStorageKeys.USER_TOKEN);
    return !(!token);
  }

  public logout(): void {
    localStorage.removeItem(LocalStorageKeys.USER_TOKEN);
  }
}
