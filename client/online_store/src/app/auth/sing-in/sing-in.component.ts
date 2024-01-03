import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Observable, ReplaySubject, catchError, finalize, forkJoin, takeUntil, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import { IUser } from '../../types/user.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../store/store.service';
import { IAddProductRequest } from '../../types/basket.interface';
import { LocalStorageKeys } from '../../types/localstorage-keys.enum';

@Component({
  selector: 'app-sing-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './sing-in.component.html',
  styleUrl: './sing-in.component.scss'
})
export class SingInComponent implements OnDestroy {
  public singInForm: FormGroup;
  public singInIsLoading: boolean;
  private _onDestroy$: ReplaySubject<void>;
  public errorMessage?: string;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _storeService: StoreService
  ) {
    this.singInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    })

    this.singInIsLoading = false;
    this._onDestroy$ = new ReplaySubject<void>(1);
  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public singIn(): void {
    this.singInIsLoading = true;
    const user: IUser = this.singInForm.value;
    this._authService.singIn({ email: user.email, password: user.password } as IUser).pipe(
      finalize(() => {
        this.singInIsLoading = false;
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      takeUntil(this._onDestroy$)
    ).subscribe(() => {
      this._transferLocalStorageToServerCart();
      this._router.navigate(['/']);
    });
  }

  private _transferLocalStorageToServerCart(): void {
    const cartData = localStorage.getItem(LocalStorageKeys.CART);
    if (cartData) {
      const productsInLS: IAddProductRequest[] = JSON.parse(cartData);
      if (productsInLS.length !== 0) {
        const transferObservables: Observable<IAddProductRequest>[] = productsInLS.map(productInLS => {
          return this._storeService.addToBasket(productInLS).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error)));
        });
        forkJoin(transferObservables).subscribe(() => {
          this._storeService.updateCartQuantity();
          localStorage.removeItem(LocalStorageKeys.CART);
        });
      } else {
        this._storeService.updateCartQuantity();
      }
    } else {
      this._storeService.updateCartQuantity();
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      this.errorMessage = error.error.message;
    } else {
      alert('Непредвиденная ошибка');
    }
    return throwError(() => error);
  }
}
