import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { IProduct, IProductResponse } from "../types/product.interface";
import { API_URL } from "../constants";
import { BehaviorSubject, Observable, ReplaySubject, catchError, takeUntil, throwError } from "rxjs";
import { IAddProductRequest, IAddProductResponse, IBasket } from "../types/basket.interface";
import { AuthService } from "../auth/auth.service";
import { LocalStorageKeys } from "../types/localstorage-keys.enum";

@Injectable({
    providedIn: 'root'
})
export class StoreService implements OnDestroy {
    public cartQuantity$: Observable<number>;
    public isAuthorized: boolean;
    private _onDestroy$: ReplaySubject<void>;
    private cartQuantitySource: BehaviorSubject<number>;

    constructor(
        private _authService: AuthService,
        private _http: HttpClient
    ) {
        this.isAuthorized = this._authService.isAuthenticated();
        this.cartQuantitySource = new BehaviorSubject<number>(0);
        this.cartQuantity$ = this.cartQuantitySource.asObservable();
        this._onDestroy$ = new ReplaySubject<void>(1);
    }

    ngOnDestroy(): void {
        this._onDestroy$.next();
        this._onDestroy$.complete();
    }

    private _getBasket(): void {
        this.getBasket().pipe(
            takeUntil(this._onDestroy$),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        ).subscribe((response: IBasket) => {
            this.cartQuantitySource.next(response.basket_products.length);
        });
    }

    public getAllProducts(page: number, limit: number): Observable<IProductResponse> {
        return this._http.get<IProductResponse>(API_URL + `product/?limit=${limit}&page=${page}`).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    public getProduct(id: string): Observable<IProduct> {
        return this._http.get<IProduct>(API_URL + `product/${id}`).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    public addToBasket(product: IAddProductRequest): Observable<IAddProductResponse> {
        return this._http.post<IAddProductResponse>(API_URL + 'basket', product).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }

    public getBasket(): Observable<IBasket> {
        return this._http.get<IBasket>(API_URL + 'basket').pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }

    public removeProductFromBasket(id: number): Observable<any> {
        return this._http.delete(API_URL + `basket/${id}`).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }

    public updateCartQuantity(): void {
        this.isAuthorized = this._authService.isAuthenticated();
        if (this.isAuthorized) {
            this._getBasket()
        } else {
            let existingCart = localStorage.getItem(LocalStorageKeys.CART);
            this.cartQuantitySource.next(existingCart ? JSON.parse(existingCart).length : 0);
        }
    }
}
