import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  nutritionEvents,
  NutritionStore,
} from '@dummy-lab/data-access-nutrition';
import type {
  NutritionCategory,
  NutritionItem,
} from '@dummy-lab/shared-models';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { NutritionTableComponent } from '@dummy-lab/ui-content-blocks';
import { Events } from '@ngrx/signals/events';

import { nutritionContent, TEST_RUNTIME_CONFIG } from '../_fixtures';
import { NutritionTableBlockComponent } from './nutrition-table-block.component';

describe('NutritionTableBlockComponent', () => {
  let fixture: ComponentFixture<NutritionTableBlockComponent>;
  let requested: (readonly NutritionCategory[])[];

  const store = {
    rows: signal<readonly NutritionItem[]>([]),
    itemsIsLoading: signal(false),
    itemsError: signal<unknown>(undefined),
    rowsTruncated: signal(false),
  };

  const inner = (): NutritionTableComponent =>
    fixture.debugElement.query(By.directive(NutritionTableComponent))
      .componentInstance;

  beforeEach(async () => {
    store.rows.set([]);
    store.itemsIsLoading.set(false);
    store.itemsError.set(undefined);
    store.rowsTruncated.set(false);
    requested = [];

    await TestBed.configureTestingModule({
      imports: [NutritionTableBlockComponent],
      providers: [
        { provide: RUNTIME_CONFIG, useValue: TEST_RUNTIME_CONFIG },
        { provide: NutritionStore, useValue: store },
      ],
    }).compileComponents();

    TestBed.inject(Events)
      .on(nutritionEvents.categoriesRequested)
      .subscribe((event) => requested.push(event.payload));

    fixture = TestBed.createComponent(NutritionTableBlockComponent);
    fixture.componentRef.setInput('content', nutritionContent);
    await fixture.whenStable();
  });

  it('requests the categories the content names, in the editor’s order', () => {
    expect(requested).toEqual([['sides', 'classic-wings']]);
  });

  it('re-requests when the block content changes under the same instance', async () => {
    fixture.componentRef.setInput('content', {
      ...nutritionContent,
      categories: [{ id: 3, category: 'beverages', label: 'Beverages' }],
    });
    await fixture.whenStable();

    expect(requested.at(-1)).toEqual(['beverages']);
  });

  it('hands the store’s rows and load state to the presentational table', async () => {
    expect(inner().content()).toBe(nutritionContent);
    expect(inner().hasError()).toBe(false);

    store.itemsIsLoading.set(true);
    store.itemsError.set(new Error('boom'));
    store.rowsTruncated.set(true);
    await fixture.whenStable();

    expect(inner().isLoading()).toBe(true);
    expect(inner().hasError()).toBe(true);
    expect(inner().isTruncated()).toBe(true);
  });
});
