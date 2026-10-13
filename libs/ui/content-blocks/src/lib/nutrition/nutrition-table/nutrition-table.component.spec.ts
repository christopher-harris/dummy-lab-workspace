import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { DEFAULT_BLOCK_SETTINGS } from '@dummy-lab/shared-models';

import { TEST_RUNTIME_CONFIG } from '../../hero/_fixtures';
import { nutritionContent, nutritionItem } from '../_fixtures';
import { NutritionTableComponent } from './nutrition-table.component';

describe('NutritionTableComponent', () => {
  let fixture: ComponentFixture<NutritionTableComponent>;
  let component: NutritionTableComponent;

  const text = (): string => fixture.nativeElement.textContent ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionTableComponent],
      providers: [{ provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', nutritionContent());
    await fixture.whenStable();
  });

  it('renders from content alone — no store, no rows, no settings', () => {
    expect(component.settings()).toBe(DEFAULT_BLOCK_SETTINGS);
    expect(component.rows()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(text()).toContain('Nutrition');
  });

  it('orders sections by the editor, not by the order rows arrive in', async () => {
    fixture.componentRef.setInput('rows', [
      nutritionItem(1, 'classic-wings'),
      nutritionItem(2, 'sides'),
      nutritionItem(3, 'classic-wings'),
    ]);
    await fixture.whenStable();

    const sections = component.sections();

    expect(sections.map((section) => section.category)).toEqual([
      'sides',
      'classic-wings',
    ]);
    expect(sections[0].rows.map((row) => row.id)).toEqual([2]);
    expect(sections[1].rows.map((row) => row.id)).toEqual([1, 3]);
  });

  it('keeps an empty section for a category with no published rows', async () => {
    fixture.componentRef.setInput('rows', [nutritionItem(1, 'sides')]);
    await fixture.whenStable();

    const wings = component
      .sections()
      .find((section) => section.category === 'classic-wings');

    expect(wings?.rows).toEqual([]);
  });

  it('shows an error instead of any table when the rows failed to load', async () => {
    fixture.componentRef.setInput('rows', [nutritionItem(1, 'sides')]);
    fixture.componentRef.setInput('hasError', true);
    await fixture.whenStable();

    expect(text()).toContain('could not be loaded');
    expect(fixture.nativeElement.querySelector('p-table')).toBeNull();
  });

  it('refuses to present a truncated guide as complete', async () => {
    fixture.componentRef.setInput('rows', [nutritionItem(1, 'sides')]);
    fixture.componentRef.setInput('isTruncated', true);
    await fixture.whenStable();

    expect(text()).toContain('incomplete');
    expect(fixture.nativeElement.querySelector('p-table')).toBeNull();
  });

  it('resolves the printable guide against the CMS origin', () => {
    expect(component.pdfHref()).toBe(
      `${TEST_RUNTIME_CONFIG.cmsBaseUrl}/uploads/guide.jpg`,
    );
  });

  it('omits the guide link when no PDF has been uploaded', async () => {
    fixture.componentRef.setInput('content', nutritionContent({ pdf: null }));
    await fixture.whenStable();

    expect(component.pdfHref()).toBeNull();
  });
});
