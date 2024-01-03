import { Route } from '@angular/router';
import { SingInComponent } from './sing-in/sing-in.component';
import { SingUpComponent } from './sing-up/sing-up.component';


export default [
    { path: '', redirectTo: 'sing-un', pathMatch: 'full' },
    { path: 'sing-up', component: SingUpComponent },
    { path: 'sing-in', component: SingInComponent }
] as Route[];