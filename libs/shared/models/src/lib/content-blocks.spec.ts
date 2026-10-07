import {
  DEFAULT_BLOCK_SETTINGS,
  resolveBlockSettings,
  toBlockInputs,
  type BlockSettings,
  type HeroDarkImageBackgroundBlock,
  type StrapiMedia,
} from './content-blocks';

const media = (name: string): StrapiMedia => ({
  id: 1,
  documentId: name,
  name,
  alternativeText: name,
  caption: null,
  width: 100,
  height: 100,
  mime: 'image/jpeg',
  url: `/uploads/${name}.jpg`,
  formats: null,
});

const darkBlock = (
  settings: BlockSettings | null,
): HeroDarkImageBackgroundBlock => ({
  __component: 'hero.dark-image-background',
  id: 4,
  content: {
    headline: 'Never Miss',
    headlineAccent: 'A Flavor Drop',
    description: 'Limited-run flavors.',
    emailPlaceholder: 'Enter your email',
    ctaLabel: 'Notify Me',
    backgroundImage: media('dark-bg'),
  },
  settings,
});

describe('DEFAULT_BLOCK_SETTINGS', () => {
  it('is `full`, so an unfilled settings component renders as the block did before settings existed', () => {
    expect(DEFAULT_BLOCK_SETTINGS.containerWidth).toBe('full');
  });

  it('is frozen, because one object is shared by every block on the page', () => {
    expect(Object.isFrozen(DEFAULT_BLOCK_SETTINGS)).toBe(true);
  });
});

describe('resolveBlockSettings', () => {
  it('falls back to the default for a settings component the editor never opened', () => {
    expect(resolveBlockSettings(null)).toBe(DEFAULT_BLOCK_SETTINGS);
    expect(resolveBlockSettings(undefined)).toBe(DEFAULT_BLOCK_SETTINGS);
  });

  it('passes real settings through untouched', () => {
    const settings: BlockSettings = { containerWidth: 'content-contained' };

    expect(resolveBlockSettings(settings)).toBe(settings);
  });
});

describe('toBlockInputs', () => {
  it('splits a block into the two inputs its component declares', () => {
    const settings: BlockSettings = { containerWidth: 'contained' };
    const block = darkBlock(settings);

    expect(toBlockInputs(block)).toEqual({
      content: block.content,
      settings,
    });
  });

  it('hands over content by reference rather than copying it', () => {
    const block = darkBlock(null);

    expect(toBlockInputs(block).content).toBe(block.content);
  });

  it('resolves a null settings component, which an `input()` default cannot', () => {
    // The host always passes the `settings` key, so the component-level
    // default never fires. This is the only thing standing between a block
    // whose settings were never filled and a `null` in the signal.
    expect(toBlockInputs(darkBlock(null)).settings).toBe(DEFAULT_BLOCK_SETTINGS);
  });
});
