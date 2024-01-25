import { Component, OnDestroy } from '@angular/core';
import { StoreService } from '../store.service';
import { Observable, ReplaySubject, catchError, finalize, forkJoin, map, mergeMap, takeUntil, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IAddProductRequest, IBasket, IBasketProducts } from '../../types/basket.interface';
import { IProduct, IProductInBasket } from '../../types/product.interface';
import { URL } from '../../constants';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { LocalStorageKeys } from '../../types/localstorage-keys.enum';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarModule, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  providers: [StoreService, AuthService],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnDestroy {
  public cartIsLoading: boolean;
  public productsInBasket: IProductInBasket[];
  public url: string;
  public subtotal: number;
  public isAuthorized: boolean;
  public product?: IProduct;
  public productsInLS: IAddProductRequest[];
  public horizontalPosition: MatSnackBarHorizontalPosition;
  public verticalPosition: MatSnackBarVerticalPosition;

  private _onDestroy$: ReplaySubject<void>


  constructor(
    private _storeService: StoreService,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) {
    this.cartIsLoading = true;
    this._onDestroy$ = new ReplaySubject<void>(1);
    this.productsInBasket = [];
    this.url = URL;
    this.subtotal = 0;
    this.productsInLS = [];
    this.isAuthorized = this._authService.isAuthenticated();

    this.horizontalPosition = 'center';
    this.verticalPosition = 'top'
    this.loadCart();

  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  private loadCart(): void {
    if (this.isAuthorized) {
      this._getFromBasket();
    } else {
      this._getFromLocalStorage();
      this._storeService.updateCartQuantity();
    }
  }

  public removeProductFromBasket(id: number): void {
    if (this.isAuthorized) {
      this._removeFromBasket(id);
    } else {
      this._removeFromLocalStorage(id);
      this._storeService.updateCartQuantity();
    }
  }

  public checkout(): void {
    this._snackBar.open('Данная функция не реализована', 'OK', {
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  private _removeFromLocalStorage(id: number): void {
    this.productsInLS.splice(id, 1);
    localStorage.setItem(LocalStorageKeys.CART, JSON.stringify(this.productsInLS));
    this._getFromLocalStorage();
  }

  private _removeFromBasket(id: number): void {
    this._storeService.removeProductFromBasket(id).pipe(
      mergeMap(() => this._storeService.getBasket()),
      map((response: IBasket) =>
        response.basket_products.map((basketProduct: IBasketProducts) => {
          return {
            id: basketProduct.id,
            name: basketProduct.product.name,
            price: basketProduct.product.price,
            img: basketProduct.product.img,
            size: basketProduct.size,
            color: basketProduct.color
          };
        })
      ),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      takeUntil(this._onDestroy$)
    ).subscribe((response: IProductInBasket[]) => {
      this.productsInBasket = response;
      this.updateSubtotal();
      this._storeService.updateCartQuantity();
    });
  }

  private _getFromBasket(): void {
    this._storeService.getBasket().pipe(
      finalize(() => {
        this.cartIsLoading = false;
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      map((response: IBasket) =>
        response.basket_products.map((basketProduct: IBasketProducts) => {
          return {
            id: basketProduct.id,
            name: basketProduct.product.name,
            price: basketProduct.product.price,
            img: basketProduct.product.img,
            size: basketProduct.size,
            color: basketProduct.color
          };
        })
      ),
      takeUntil(this._onDestroy$)
    ).subscribe((response: IProductInBasket[]) => {
      this.productsInBasket = response;
      this.updateSubtotal();
    });
  }

  private _getFromLocalStorage(): void {
    const cartData: string | null = localStorage.getItem(LocalStorageKeys.CART);
    if (cartData) {
      this.productsInLS = JSON.parse(cartData);
      if (this.productsInLS.length !== 0) {
        const productObservables: Observable<IProduct>[] = this.productsInLS.map(productInLS => {
          const idString = productInLS.productId.toString();
          return this._storeService.getProduct(idString);
        });
        forkJoin(productObservables).pipe(
          map((response: IProduct[]) =>
            response.map((product: IProduct, index: number) => {
              const productInLS: IAddProductRequest = this.productsInLS[index];
              return {
                id: index,
                name: product.name,
                price: product.price,
                img: product.img,
                size: productInLS.size,
                color: productInLS.color
              };
            })
          ),
          catchError((error: HttpErrorResponse) => this.handleError(error)),
        ).subscribe((response: IProductInBasket[]) => {
          this.productsInBasket = response;
          this.updateSubtotal();
        });
      } else {
        this.productsInBasket = [];
        this.updateSubtotal();
      }
    } else {
      this.productsInBasket = [];
      this.updateSubtotal();
    }
    this.cartIsLoading = false;
  }

  private updateSubtotal(): void {
    this.subtotal = this.productsInBasket.reduce((acc, product) => acc + product.price, 0);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      alert(error.error.message);
    } else {
      alert('Непредвиденная ошибка');
    }
    return throwError(() => error);
  }
}  