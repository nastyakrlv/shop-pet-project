import { Route } from '@angular/router';
import { CartComponent } from './cart/cart.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './product/product.component';

export default [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'cart', component: CartComponent },
    { path: 'home', component: HomeComponent },
    { path: 'shop', component: ShopComponent },
    { path: 'product/:id', component: ProductComponent }
] as Route[];
