import { Component, OnDestroy } from '@angular/core';
import { IProduct, IProductResponse } from '../../types/product.interface';
import { Observable, ReplaySubject, catchError, finalize, takeUntil, throwError } from 'rxjs';
import { StoreService } from '../store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { URL } from "../../constants";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [MatPaginatorModule, CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnDestroy {
  public productsIsLoading: boolean;
  public url: string;
  public length: number;
  public pageIndex: number;
  public pageSize: number;
  public products: IProduct[];
  private _onDestroy$: ReplaySubject<void>;


  constructor(private _storeService: StoreService) {
    this.products = []
    this.productsIsLoading = true;
    this.url = URL;

    this.length = 0;
    this.pageIndex = 0;
    this.pageSize = 6;

    this._onDestroy$ = new ReplaySubject<void>(1);

    this._getAllProducts(this.pageIndex + 1, this.pageSize)
  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public handlePageEvent(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this._getAllProducts(this.pageIndex + 1, this.pageSize);
  }

  private _getAllProducts(page: number, limit: number): void {
    this.productsIsLoading = true;
    this._storeService.getAllProducts(page, limit).pipe(
      finalize(() => {
        this.productsIsLoading = false;
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      takeUntil(this._onDestroy$)
    ).subscribe((response: IProductResponse) => {
      this.products = response.rows;
      this.length = response.count
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
