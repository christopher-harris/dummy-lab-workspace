import { describe, expect, expectTypeOf, it } from 'vitest';

import type { PaginatedItems, PaginatedResponse } from './lib/models';

interface Widget {
  id: number;
  title: string;
}

type WidgetsResponse = PaginatedResponse<'widgets', Widget>;

interface ExtendedWidgetsResponse extends PaginatedResponse<'widgets', Widget> {
  categories: string[];
}

describe('PaginatedResponse', () => {
  it('shapes a DummyJSON list envelope', () => {
    const response: WidgetsResponse = {
      widgets: [{ id: 1, title: 'Sprocket' }],
      total: 50,
      skip: 0,
      limit: 30,
    };

    expect(response.widgets).toHaveLength(1);
    expectTypeOf(response.widgets).toEqualTypeOf<Widget[]>();
    expectTypeOf(response.total).toBeNumber();
  });

  it('can be extended with resource-specific fields', () => {
    const response: ExtendedWidgetsResponse = {
      widgets: [],
      categories: ['hardware'],
      total: 0,
      skip: 0,
      limit: 30,
    };

    expect(response.categories).toEqual(['hardware']);
  });

  it('exposes the item type via PaginatedItems', () => {
    expectTypeOf<PaginatedItems<WidgetsResponse, 'widgets'>>().toEqualTypeOf<
      Widget[]
    >();
  });
});
