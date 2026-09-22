import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopPostsCardComponent } from './top-posts-card.component';

describe('TopPostsCardComponent', () => {
  let component: TopPostsCardComponent;
  let fixture: ComponentFixture<TopPostsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopPostsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopPostsCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
