import type {
  HeroCenteredProductImageContent,
  NutritionTableContent,
  StrapiMedia,
} from '@dummy-lab/shared-models';

/** Spec fixtures. Not exported from the library barrel. */
export const TEST_RUNTIME_CONFIG = {
  environment: 'local',
  apiBaseUrl: 'https://dummyjson.com',
  cmsBaseUrl: 'http://localhost:1337',
  features: { experimentalCatalog: false },
} as const;

export const testMedia = (name: string): StrapiMedia => ({
  id: 1,
  documentId: name,
  name,
  alternativeText: `${name} alt`,
  caption: null,
  width: 100,
  height: 100,
  mime: 'image/jpeg',
  url: `/uploads/${name}.jpg`,
  formats: null,
});

export const heroContent: HeroCenteredProductImageContent = {
  headline: 'Where Flavor',
  headlineAccent: 'Gets Its Wings',
  eyebrow: '12 signature flavors',
  ctaLabel: 'Order Now',
  imageLight: testMedia('light'),
  imageDark: testMedia('dark'),
};

export const nutritionContent: NutritionTableContent = {
  heading: 'Nutrition',
  intro: null,
  categories: [
    { id: 1, category: 'sides', label: 'Sides' },
    { id: 2, category: 'classic-wings', label: 'Classic Wings' },
  ],
  pdf: null,
  pdfLabel: null,
  footnote: null,
};
