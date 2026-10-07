/**
 * CMS content block shapes, exactly as Strapi returns them.
 *
 * These live in `shared/models` rather than in `data-access/content` because
 * both sides need them and only one of them may import the other: the blocks
 * in `ui/content-blocks` take their content as a typed input, and the content
 * store types its resource with the same shapes. Putting them in `data-access`
 * would force `type:ui` to depend on `type:data-access`, which is the import
 * direction PROVE-OUT P22 exists to prevent.
 *
 * Every block is an envelope of two nested Strapi components: `content` (what
 * it says) and `settings` (how it presents). That split is structural rather
 * than a naming convention, so "is this field copy or presentation?" is
 * answered by where it lives instead of by argument.
 *
 * Only the fields the application populates are typed. Strapi returns more on
 * every media object (`hash`, `ext`, `provider`, `previewUrl`, …) and an `id`
 * on every nested component; they are left off rather than guessed at.
 */

/** Icons marketing may choose. Mapping these to PrimeIcons classes is the block's job. */
export type HeroLinkIcon =
  | 'apple'
  | 'android'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'x';

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  /** Strapi writes `''` when cleared, `null` when never set. */
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  mime: string;
  /**
   * Root-relative (`/uploads/x.jpg`) under the local upload provider, absolute
   * under S3 or a CDN. Resolve it with `CmsMediaUrlPipe`.
   */
  url: string;
  formats: Record<string, StrapiMediaFormat> | null;
}

export interface SharedIconLink {
  id: number;
  icon: HeroLinkIcon;
  href: string;
  label: string;
}

/* -------------------------------------------------------------------------
 * Settings — the presentation half of every block
 * ---------------------------------------------------------------------- */

/**
 * How wide a block's content column runs. A closed vocabulary, not a CSS
 * value: the frontend owns what each one measures, so retuning `contained` is
 * a frontend change rather than a content migration. Same contract as
 * `HeroLinkIcon`.
 */
export type BlockContainerWidth = 'full' | 'contained' | 'content-contained';

/**
 * Mirrors Strapi's `shared.block-settings`, which is the same component on
 * every block so the vocabulary cannot drift per block type.
 *
 * The nested component's `id` is deliberately not typed — nothing reads it,
 * and omitting it lets `DEFAULT_BLOCK_SETTINGS` be a real `BlockSettings`
 * rather than one carrying a fabricated id.
 */
export interface BlockSettings {
  containerWidth: BlockContainerWidth;
}

/**
 * `full` rather than `contained`, so an unfilled settings component renders
 * exactly as these blocks rendered before settings existed. Narrowing is the
 * opt-in.
 *
 * Frozen because one object is handed to every block component on the page.
 */
export const DEFAULT_BLOCK_SETTINGS: BlockSettings = Object.freeze({
  containerWidth: 'full',
});

/**
 * `settings` is optional in Strapi, so an editor who never opened the section
 * yields `null` — with a 200, not an error. This is the only place that `null`
 * becomes a renderable value.
 */
export function resolveBlockSettings(
  settings: BlockSettings | null | undefined,
): BlockSettings {
  return settings ?? DEFAULT_BLOCK_SETTINGS;
}

/* -------------------------------------------------------------------------
 * Content — the copy half, one shape per block
 * ---------------------------------------------------------------------- */

interface HeroContentBase {
  headline: string;
  headlineAccent: string;
}

export interface HeroCenteredProductImageContent extends HeroContentBase {
  eyebrow: string;
  ctaLabel: string;
  imageLight: StrapiMedia;
  imageDark: StrapiMedia;
}

export interface HeroRightAlignedImageContent extends HeroContentBase {
  description: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  image: StrapiMedia;
}

export interface HeroLightImageBackgroundContent extends HeroContentBase {
  description: string;
  ctaLabel: string;
  availabilityNote: string;
  links: SharedIconLink[];
  backgroundImage: StrapiMedia;
}

export interface HeroDarkImageBackgroundContent extends HeroContentBase {
  description: string;
  emailPlaceholder: string;
  ctaLabel: string;
  backgroundImage: StrapiMedia;
}

/* -------------------------------------------------------------------------
 * Blocks — the dynamic-zone envelope
 * ---------------------------------------------------------------------- */

/**
 * What a dynamic-zone entry looks like once `content` and `settings` are
 * populated. `id` stays on the envelope rather than moving into `content`
 * because the carousel keys its slides on it.
 */
interface ContentBlockEnvelope<TContent> {
  id: number;
  /**
   * `null` when the component did not come back: a query that failed to
   * populate it, or a dynamic-zone row left behind by a schema change. Strapi
   * reports both with a 200, so this is a normal response rather than an
   * error, and the renderer has to decide what to do about it — see
   * `toBlockInputs`.
   */
  content: TContent | null;
  settings: BlockSettings | null;
}

/*
 * Declared as `interface … extends` rather than a generic type alias so the
 * block name survives into compiler errors — `HeroCenteredProductImageBlock`
 * reads better in a registry mismatch than an expanded generic does.
 */
export interface HeroCenteredProductImageBlock
  extends ContentBlockEnvelope<HeroCenteredProductImageContent> {
  __component: 'hero.centered-product-image';
}

export interface HeroRightAlignedImageBlock
  extends ContentBlockEnvelope<HeroRightAlignedImageContent> {
  __component: 'hero.right-aligned-image';
}

export interface HeroLightImageBackgroundBlock
  extends ContentBlockEnvelope<HeroLightImageBackgroundContent> {
  __component: 'hero.light-image-background';
}

export interface HeroDarkImageBackgroundBlock
  extends ContentBlockEnvelope<HeroDarkImageBackgroundContent> {
  __component: 'hero.dark-image-background';
}

/**
 * Discriminated on Strapi's own `__component`, so the block registry switches
 * on it with no translation step.
 */
export type HeroSlideBlock =
  | HeroCenteredProductImageBlock
  | HeroRightAlignedImageBlock
  | HeroLightImageBackgroundBlock
  | HeroDarkImageBackgroundBlock;

/**
 * Maps every block key to the block it carries.
 *
 * This is the type the registry is built from: a mapped type over these keys
 * means a block added to `HeroSlideBlock` without a registered component is a
 * compile error, not a blank slide at runtime.
 */
export type ContentBlockMap = {
  [B in HeroSlideBlock as B['__component']]: B;
};

export type ContentBlockKey = keyof ContentBlockMap;

/**
 * The input object for a block's rendered component.
 *
 * `NgComponentOutlet`'s `ngComponentOutletInputs` is `Record<string, unknown>`,
 * so the host can hand a block component anything at all and the compiler will
 * not notice. Building the object here is what makes that call site typed:
 * `B['content']` tracks the concrete block, so widening the envelope later
 * breaks at compile time rather than in the carousel.
 *
 * It also coalesces `settings`. An `input()` default only applies when the key
 * is *absent*, and the host always passes the key — so without this a block
 * whose settings an editor never opened would receive `null`.
 *
 * Returns `null` for a block whose `content` did not come back. The caller
 * drops those: a block component reads `content().headline` directly, so
 * handing it `null` throws inside the template and takes down every other
 * block on the page with it. One missing slide is a cheaper failure than a
 * blank homepage (PROVE-OUT P24).
 */
export function toBlockInputs<B extends HeroSlideBlock>(
  block: B,
): { content: NonNullable<B['content']>; settings: BlockSettings } | null {
  const content = block.content;

  if (content === null) {
    return null;
  }

  return {
    content: content as NonNullable<B['content']>,
    settings: resolveBlockSettings(block.settings),
  };
}
