import { Route } from '@angular/router';
import { StoreComponent } from './store/store.component';

export const routes: Route[] = [
    { path: '', component: StoreComponent, loadChildren: () => import('./store/store.routes') },
    { path: 'auth', loadChildren: () => import('./auth/auth.routes') }
];
