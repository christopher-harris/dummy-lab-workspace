import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

import { CartDrawerComponent } from './cart-drawer.component';

describe('CartDrawerComponent', () => {
  let component: CartDrawerComponent;
  let fixture: ComponentFixture<CartDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartDrawerComponent],
      providers: [
        {
          provide: RUNTIME_CONFIG,
          useValue: {
            environment: 'local',
            apiBaseUrl: 'https://dummyjson.com',
            features: { experimentalCatalog: false },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartDrawerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
