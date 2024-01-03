import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent {

}
