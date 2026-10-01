import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingArticlesComponent } from './landing-articles.component';

describe('LandingArticlesComponent', () => {
  let component: LandingArticlesComponent;
  let fixture: ComponentFixture<LandingArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingArticlesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingArticlesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a card per blog entry', () => {
    const text = fixture.nativeElement.textContent ?? '';

    for (const blog of component.blogs) {
      expect(text).toContain(blog.title);
      expect(text).toContain(blog.author.name);
    }
  });

  it('renders the cover image for each entry', () => {
    const sources = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        'img',
      ),
    ).map((img) => img.getAttribute('src'));

    for (const blog of component.blogs) {
      expect(sources).toContain(blog.cover);
    }
  });
});
