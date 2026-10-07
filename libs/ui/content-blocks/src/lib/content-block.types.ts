import type { InputSignal, Type } from '@angular/core';
import type {
  BlockSettings,
  ContentBlockKey,
  ContentBlockMap,
} from '@dummy-lab/shared-models';

/**
 * The contract every block component implements: its copy arrives as a
 * required `content` input, its presentation as a defaulted `settings` input,
 * and it resolves neither for itself.
 *
 * Two inputs rather than one `block` so the halves stay separable — `settings`
 * carries a frontend default, which makes a block renderable in a spec or a
 * future preview harness without one.
 *
 * `InputSignal<T>` rather than plain `T` because that is what `input()`
 * actually puts on the class, so the registry below checks the real
 * declaration rather than a convention. It is also what makes the check
 * strict — see the note on `ContentBlockRegistry`.
 */
export interface ContentBlockComponent<TContent> {
  readonly content: InputSignal<TContent>;
  readonly settings: InputSignal<BlockSettings>;
}

/**
 * The `content` payload carried by a given block key.
 *
 * `NonNullable` because the wire type allows `content: null` for a component
 * Strapi did not return, but a block component is only ever constructed with
 * real content — the host drops the rest.
 */
export type ContentBlockContentOf<K extends ContentBlockKey> = NonNullable<
  ContentBlockMap[K]['content']
>;

/**
 * The registry, as a type.
 *
 * Mapped over `ContentBlockKey`, which is derived from the block union in
 * `@dummy-lab/shared-models`, so two things fail at compile time rather than
 * at runtime:
 *
 * - adding a block to the union without registering a component — the mapped
 *   type demands every key be present;
 * - registering a component whose `content` input is a different block's
 *   content type — `component` is resolved per key.
 *
 * The second check is invariant, not merely covariant. `InputSignal<T>` is
 * `InputSignalWithTransform<T, T>`, whose signal node declares
 * `transformFn: ((value: T) => T) | undefined`, which puts `T` in a parameter
 * position; under `strictFunctionTypes` that makes `InputSignal<A>` assignable
 * to `InputSignal<B>` only when `A` and `B` are mutually assignable. So a
 * content type that is merely a structural subtype of another still fails to
 * register under the wrong key.
 *
 * That is the whole point of the exercise. A Strapi schema change that outruns
 * the frontend should break the build, not render a blank slide.
 */
export type ContentBlockRegistry = {
  [K in ContentBlockKey]: {
    /** Strapi's component uid, e.g. `hero.centered-product-image`. */
    key: K;
    /** Block family, for grouping in a future builder or preview UI. */
    family: string;
    /** Human-readable label. */
    label: string;
    component: Type<ContentBlockComponent<ContentBlockContentOf<K>>>;
  };
};

/** One registry entry, correctly typed for whichever key it came from. */
export type ContentBlockEntry = ContentBlockRegistry[ContentBlockKey];
