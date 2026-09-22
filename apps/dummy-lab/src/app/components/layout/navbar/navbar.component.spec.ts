import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { appRoutes } from '../../../app.routes';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      // The navbar derives its menu from `Router.config`, so it needs the real
      // route tree — `provideRouter([])` leaves `routeConfig()[0]` undefined.
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds menu items from the shell child routes', () => {
    const labels = component.menuItems().map((item) => item.label);

    expect(labels).toEqual([
      'Products | Dummy Lab',
      'Users | Dummy Lab',
      'Carts | Dummy Lab',
      'Posts | Dummy Lab',
      'Recipes | Dummy Lab',
      'Todos | Dummy Lab',
      'Quotes | Dummy Lab',
    ]);
  });

  it('excludes the index, dashboard and auth routes', () => {
    const paths = component.apps().map((route) => route.path);

    expect(paths).not.toContain('');
    expect(paths).not.toContain('dashboard');
    expect(paths).not.toContain('auth');
  });
});
