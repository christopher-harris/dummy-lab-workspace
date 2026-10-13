import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemeStore } from '@dummy-lab/data-access-theme';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { CenteredProductImageComponent } from '@dummy-lab/ui-content-blocks';

import { heroContent, TEST_RUNTIME_CONFIG } from '../_fixtures';
import { CenteredProductImageBlockComponent } from './centered-product-image-block.component';

describe('CenteredProductImageBlockComponent', () => {
  let fixture: ComponentFixture<CenteredProductImageBlockComponent>;
  const isDark = signal(false);

  const inner = (): CenteredProductImageComponent =>
    fixture.debugElement.query(By.directive(CenteredProductImageComponent))
      .componentInstance;

  beforeEach(async () => {
    isDark.set(false);

    await TestBed.configureTestingModule({
      imports: [CenteredProductImageBlockComponent],
      providers: [
        { provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG },
        { provide: ThemeStore, useValue: { isDark } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CenteredProductImageBlockComponent);
    fixture.componentRef.setInput('content', heroContent);
    await fixture.whenStable();
  });

  it('passes content and settings through to the presentational block', () => {
    expect(inner().content()).toBe(heroContent);
    expect(inner().settings()).toBe(fixture.componentInstance.settings());
  });

  it('binds the image to the theme store, following the in-app toggle', async () => {
    expect(inner().dark()).toBe(false);
    expect(inner().heroImage().src).toContain('/uploads/light.jpg');

    isDark.set(true);
    await fixture.whenStable();

    expect(inner().dark()).toBe(true);
    expect(inner().heroImage().src).toContain('/uploads/dark.jpg');
  });

  it('stays out of the layout', () => {
    expect(fixture.nativeElement.style.display).toBe('contents');
  });
});
