import type { Schema, Struct } from '@strapi/strapi';

export interface HeroContentCenteredProductImage
  extends Struct.ComponentSchema {
  collectionName: 'components_hero_content_centered_product_images';
  info: {
    description: "Copy and artwork for the centered-product-image hero. Carries a light/dark artwork pair because this block is the page's LCP element and the frontend picks one image rather than shipping both. Alt text lives on the media asset, not here.";
    displayName: 'Hero Content \u2014 Centered Product Image';
    icon: 'picture';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    headline: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    headlineAccent: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    imageDark: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imageLight: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface HeroContentDarkImageBackground extends Struct.ComponentSchema {
  collectionName: 'components_hero_content_dark_image_backgrounds';
  info: {
    description: 'Copy and photo for the email-capture hero. The input placeholder is content because it is user-facing copy; where the address is submitted is not, and stays in the frontend.';
    displayName: 'Hero Content \u2014 Dark Image Background';
    icon: 'envelop';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    ctaLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 240;
      }>;
    emailPlaceholder: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    headline: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    headlineAccent: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
  };
}

export interface HeroContentLightImageBackground
  extends Struct.ComponentSchema {
  collectionName: 'components_hero_content_light_image_backgrounds';
  info: {
    description: 'Copy, CTA, availability note and icon links for the light-image-background hero. The background image is decorative \u2014 the frontend composes it as a CSS background layer, so its alt text is intentionally unused.';
    displayName: 'Hero Content \u2014 Light Image Background';
    icon: 'sun';
  };
  attributes: {
    availabilityNote: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    ctaLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 240;
      }>;
    headline: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    headlineAccent: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    links: Schema.Attribute.Component<'shared.icon-link', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 1;
        },
        number
      >;
  };
}

export interface HeroContentRightAlignedImage extends Struct.ComponentSchema {
  collectionName: 'components_hero_content_right_aligned_images';
  info: {
    description: 'Copy and artwork for the right-aligned-image hero. The only hero block with two CTAs; both labels are required so the pair never renders half-populated. Alt text lives on the media asset, not here.';
    displayName: 'Hero Content \u2014 Right Aligned Image';
    icon: 'arrowRight';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 240;
      }>;
    headline: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    headlineAccent: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    primaryCtaLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
    secondaryCtaLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 24;
      }>;
  };
}

export interface HeroCenteredProductImage extends Struct.ComponentSchema {
  collectionName: 'components_hero_centered_product_images';
  info: {
    description: 'Eyebrow pill, two-line headline and a single CTA over centered product artwork. Split into content (what it says) and settings (how it presents) so the line between copy and presentation is structural rather than a convention \u2014 see PROVE-OUT P22.';
    displayName: 'Hero \u2014 Centered Product Image';
    icon: 'picture';
  };
  attributes: {
    content: Schema.Attribute.Component<
      'hero-content.centered-product-image',
      false
    > &
      Schema.Attribute.Required;
    settings: Schema.Attribute.Component<'shared.block-settings', false>;
  };
}

export interface HeroDarkImageBackground extends Struct.ComponentSchema {
  collectionName: 'components_hero_dark_image_backgrounds';
  info: {
    description: 'Email-capture hero: photo under a gradient stack, with an inline input and submit button. Split into content and settings; the settings constrain the copy column only, never the gradient stack.';
    displayName: 'Hero \u2014 Dark Image Background';
    icon: 'envelop';
  };
  attributes: {
    content: Schema.Attribute.Component<
      'hero-content.dark-image-background',
      false
    > &
      Schema.Attribute.Required;
    settings: Schema.Attribute.Component<'shared.block-settings', false>;
  };
}

export interface HeroLightImageBackground extends Struct.ComponentSchema {
  collectionName: 'components_hero_light_image_backgrounds';
  info: {
    description: 'Full-bleed photo behind a radial scrim, with a CTA, an availability note and a row of icon links. Split into content and settings; the settings constrain the copy column only, never the photo.';
    displayName: 'Hero \u2014 Light Image Background';
    icon: 'sun';
  };
  attributes: {
    content: Schema.Attribute.Component<
      'hero-content.light-image-background',
      false
    > &
      Schema.Attribute.Required;
    settings: Schema.Attribute.Component<'shared.block-settings', false>;
  };
}

export interface HeroRightAlignedImage extends Struct.ComponentSchema {
  collectionName: 'components_hero_right_aligned_images';
  info: {
    description: 'Copy on the left, product artwork on the right. Split into content and settings. Note that containerWidth has limited effect here: the copy column is already half the viewport and the artwork must bleed to the right edge for its clip-path to read correctly.';
    displayName: 'Hero \u2014 Right Aligned Image';
    icon: 'arrowRight';
  };
  attributes: {
    content: Schema.Attribute.Component<
      'hero-content.right-aligned-image',
      false
    > &
      Schema.Attribute.Required;
    settings: Schema.Attribute.Component<'shared.block-settings', false>;
  };
}

export interface SharedBlockSettings extends Struct.ComponentSchema {
  collectionName: 'components_shared_block_settings';
  info: {
    description: 'Presentation choices shared by every content block. The values are a closed vocabulary the frontend maps to design-system classes, never raw CSS: a width that is not in this enum is a frontend change rather than a content migration. One shared component instead of one per block, because an identical vocabulary everywhere is the thing that keeps the rule enforceable.';
    displayName: 'Block Settings';
    icon: 'cog';
  };
  attributes: {
    containerWidth: Schema.Attribute.Enumeration<
      ['full', 'contained', 'content-contained']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'full'>;
  };
}

export interface SharedIconLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_icon_links';
  info: {
    description: 'An outbound link rendered as an icon only. The icon is a constrained vocabulary, not a CSS class: the frontend owns the mapping from these values to PrimeIcons classes, so a renamed icon set is a frontend change rather than a content migration.';
    displayName: 'Icon Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2048;
      }>;
    icon: Schema.Attribute.Enumeration<
      ['apple', 'android', 'facebook', 'instagram', 'tiktok', 'youtube', 'x']
    > &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'hero-content.centered-product-image': HeroContentCenteredProductImage;
      'hero-content.dark-image-background': HeroContentDarkImageBackground;
      'hero-content.light-image-background': HeroContentLightImageBackground;
      'hero-content.right-aligned-image': HeroContentRightAlignedImage;
      'hero.centered-product-image': HeroCenteredProductImage;
      'hero.dark-image-background': HeroDarkImageBackground;
      'hero.light-image-background': HeroLightImageBackground;
      'hero.right-aligned-image': HeroRightAlignedImage;
      'shared.block-settings': SharedBlockSettings;
      'shared.icon-link': SharedIconLink;
    }
  }
}
