import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ProductsListPage } from './products-list.page';

describe('ProductsListPage', () => {
  let component: ComponentFixture<ProductsListPage>['componentInstance'];
  let fixture: ComponentFixture<ProductsListPage>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListPage],
      providers: [
        // `RouterLink` in the template needs ActivatedRoute; ProductsStore's
        // `withRouterContext()` needs the Router itself.
        provideRouter([]),
        // ProductsStore builds `httpResource`s on construction — back them with
        // the testing backend so nothing reaches the network.
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListPage);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);

    // Let the store's resource effects issue their requests...
    fixture.detectChanges();

    // ...then answer them. Outstanding requests keep Angular's pending-task
    // count above zero, so `whenStable()` never settles until they resolve.
    for (const request of httpTesting.match(() => true)) {
      request.flush({ products: [], total: 0, skip: 0, limit: 0 });
    }

    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.match(() => true).forEach((request) => request.flush({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to the grid layout with no sort applied', () => {
    expect(component.layout()).toBe('grid');
    expect(component.sortKey()).toBeNull();
    expect(component.sortField()).toBe('');
    expect(component.sortOrder()).toBe(1);
  });

  it('derives sort field and direction from the sort key', () => {
    component.sortKey.set('!price');
    expect(component.sortField()).toBe('price');
    expect(component.sortOrder()).toBe(-1);

    component.sortKey.set('title');
    expect(component.sortField()).toBe('title');
    expect(component.sortOrder()).toBe(1);
  });

  it('labels stock levels by remaining quantity', () => {
    const product = (stock: number) => ({ stock }) as never;

    expect(component.stockLabel(product(0))).toBe('Out of Stock');
    expect(component.stockSeverity(product(0))).toBe('danger');

    expect(component.stockLabel(product(4))).toBe('Low Stock (4)');
    expect(component.stockSeverity(product(4))).toBe('warn');

    expect(component.stockLabel(product(42))).toBe('In Stock');
    expect(component.stockSeverity(product(42))).toBe('success');
  });

  it('exposes an empty product list when the resource returns none', () => {
    expect(component.products()).toEqual([]);
  });
});
