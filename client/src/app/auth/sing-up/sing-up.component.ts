import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { IUser } from '../../types/user.interface';
import { AuthService } from '../auth.service';
import { Observable, ReplaySubject, catchError, finalize, forkJoin, takeUntil, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../store/store.service';
import { LocalStorageKeys } from '../../types/localstorage-keys.enum';
import { IAddProductRequest } from '../../types/basket.interface';

@Component({
  selector: 'app-sing-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './sing-up.component.html',
  styleUrl: './sing-up.component.scss'
})
export class SingUpComponent implements OnDestroy {
  public singUpForm: FormGroup;
  public singUpIsLoading: boolean;
  public errorMessage?: string;
  private _onDestroy$: ReplaySubject<void>;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _storeService: StoreService
  ) {
    this.singUpForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required)
    })

    this.singUpIsLoading = false;
    this._onDestroy$ = new ReplaySubject<void>(1);
  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public singUp(): void {
    this.singUpIsLoading = true;
    const user: IUser = this.singUpForm.value;
    if (user.password === user.confirmPassword) {
      this._authService.singUp({ email: user.email, password: user.password } as IUser).pipe(
        finalize(() => {
          this.singUpIsLoading = false;
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error)),
        takeUntil(this._onDestroy$)
      ).subscribe(() => {
        this._transferLocalStorageToServerCart();
        this._router.navigate(['/']);
      });
    } else {
      this.errorMessage = "Пароли не совпадают";
      this.singUpIsLoading = false;
    }
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
