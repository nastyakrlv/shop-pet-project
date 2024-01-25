import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { Observable, ReplaySubject, catchError, finalize, takeUntil, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IInfo, IProduct } from '../../types/product.interface';
import { CommonModule } from '@angular/common';
import { URL } from '../../constants';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GetColorName } from 'hex-color-to-color-name';
import { MatButtonModule } from '@angular/material/button';
import { IAddProductRequest } from '../../types/basket.interface';
import { AuthService } from '../../auth/auth.service';
import { LocalStorageKeys } from '../../types/localstorage-keys.enum';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, FormsModule, ReactiveFormsModule, MatButtonToggleModule, MatButtonModule],
  providers: [StoreService, AuthService],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnDestroy {
  public id: string;
  public productIsLoading: boolean
  public product?: IProduct;
  public url: string;
  public colorDescriptions: string[];
  public productForm: FormGroup;
  public addToCartIsLoading: boolean;
  public isAuthorized: boolean;
  private _onDestroy$: ReplaySubject<void>;

  constructor(
    private _route: ActivatedRoute,
    private _storeService: StoreService,
    private _authService: AuthService
  ) {
    this.id = this._route.snapshot.paramMap.get('id')!;
    this.productIsLoading = true;
    this.addToCartIsLoading = false;
    this._onDestroy$ = new ReplaySubject<void>(1);
    this.url = URL;
    this.colorDescriptions = [];

    this.isAuthorized = this._authService.isAuthenticated();


    this._getProduct(this.id);

    this.productForm = new FormGroup({
      size: new FormControl('', Validators.required),
      color: new FormControl('', Validators.required),
    });

  }

  public ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public getColors(): void {
    this.product?.info?.forEach((info: IInfo) => {
      if (info.title.toLowerCase() === 'color' && Array.isArray(info.description)) {
        (info.description as string[]).forEach((color: string) => {
          const colorName: string = GetColorName(color);
          this.colorDescriptions.push(colorName);
        });
      }
    });
  }

  public isSelected(selectedColor: string): boolean {
    return this.productForm.get('color')?.value === selectedColor;
  }

  public onAddToCart(): void {
    this.addToCartIsLoading = true;
    const product: IAddProductRequest = {
      productId: parseInt(this.id),
      size: this.productForm.value.size,
      color: this.productForm.value.color
    };
    if (this.isAuthorized) {
      this.addToBasketViaService(product);
    } else {
      this.addToCartInLocalStorage(product);
      this._storeService.updateCartQuantity()

    }
  }

  private addToCartInLocalStorage(product: IAddProductRequest): void {
    let existingCart: string | null = localStorage.getItem(LocalStorageKeys.CART);
    let cart: IAddProductRequest[] = existingCart ? JSON.parse(existingCart) : [];
    cart.push(product);
    localStorage.setItem(LocalStorageKeys.CART, JSON.stringify(cart));
    this.addToCartIsLoading = false;
  }

  private addToBasketViaService(product: IAddProductRequest): void {
    this.addToCartIsLoading = true;
    this._storeService.addToBasket(product).pipe(
      finalize(() => {
        this.addToCartIsLoading = false;
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      takeUntil(this._onDestroy$),
    ).subscribe(() => {
      this._storeService.updateCartQuantity()
    });
  }

  private _getProduct(id: string): void {
    this._storeService.getProduct(id).pipe(
      finalize(() => {
        this.productIsLoading = false;
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      takeUntil(this._onDestroy$)
    ).subscribe((response: IProduct) => {
      this.product = response;
      this.getColors();
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 404) {
      alert(error.error.message);
    } else {
      alert('Непредвиденная ошибка');
    }
    return throwError(() => error);
  }
}
