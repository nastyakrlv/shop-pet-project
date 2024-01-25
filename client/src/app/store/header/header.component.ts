import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { StoreService } from '../store.service';
import { ReplaySubject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, MatMenuModule, MatButtonModule, MatBadgeModule],
  providers: [StoreService, AuthService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  public isAuthorized: boolean;
  public cartQuantity: number;
  private _onDestroy$: ReplaySubject<void>;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _storeService: StoreService
  ) {
    this.isAuthorized = this._authService.isAuthenticated();
    this._onDestroy$ = new ReplaySubject<void>(1);
    this.cartQuantity = 0;

    this._storeService.cartQuantity$.pipe(
      takeUntil(this._onDestroy$)
    ).subscribe(quantity => {
      this.cartQuantity = quantity;
    });

    this._storeService.updateCartQuantity();
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public isActive(url: string): boolean {
    return this._router.url === url;
  }

  public logout(): void {
    this._authService.logout();
    this._storeService.updateCartQuantity();
    this.isAuthorized = this._authService.isAuthenticated();
  }
}
