# feature-content-blocks

The content-block registry, and the blocks that need domain data.

Import path: `@dummy-lab/feature-content-blocks`

`@dummy-lab/ui-content-blocks` holds every block's presentation and knows
nothing about where data comes from (ADR-0001 Decision 4). This library is the
other half:

- **Data-bound blocks** — thin wrappers that read a store or dispatch an event
  and pass the result to a presentational block as inputs.
  `CenteredProductImageBlockComponent` binds the hero image to `ThemeStore`;
  `NutritionTableBlockComponent` requests and supplies the nutrition rows.
- **The registry** — `CONTENT_BLOCK_REGISTRY` and `getContentBlockEntry()`. It
  lives here because it maps keys to both kinds of block, and a `ui` library
  cannot import a `feature` one.

Adding a block: build the presentational component in `ui-content-blocks`. If it
needs data, add a wrapper here that satisfies the same `content` / `settings`
contract. Register whichever one the page should render.

One library for every data-bound block, so the `ui` / `feature` rule does not
cost a library per block.

## Running unit tests

Run `nx test feature-content-blocks`.
