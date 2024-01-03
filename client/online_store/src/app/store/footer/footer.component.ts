import { Component } from '@angular/core';
import { IServices } from '../../types/services.interface';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public services: IServices[];

  constructor() {
    this.services = [
      {
        imageUrl: 'assets/icons/highquality.svg',
        name: 'High Quality',
        description: 'Crafted from top materials'
      },
      {
        imageUrl: 'assets/icons/warranyprotection.svg',
        name: 'Warrany Protection',
        description: 'Over 2 years'
      },
      {
        imageUrl: 'assets/icons/freeshipping.svg',
        name: 'Free Shipping',
        description: 'Order over 150 $'
      },
      {
        imageUrl: 'assets/icons/support.svg',
        name: '24 / 7 Support',
        description: 'Dedicated support'
      }
    ]
  }
}
