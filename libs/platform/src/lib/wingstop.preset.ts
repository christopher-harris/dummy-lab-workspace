import {definePreset} from "@primeuix/themes";
import Aura from '@primeuix/themes/aura';

export const WINGSTOP_PRESET = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  },
  components: {
    button: {
      extend: {
        accent: {
          color: '#f59e0b',
          inverseColor: '#ffffff'
        }
      },
      css: ({dt}) => `
.p-button-accent {
    background: ${dt('button.accent.color')};
    color: ${dt('button.accent.inverse.color')};
    transition-duration: ${dt('my.transition.fast')};
}
`
    }
  }
});

export const MyPreset = definePreset(Aura, {
  components: {
    // custom button tokens and additional style
    button: {
      extend: {
        accent: {
          color: '#f59e0b',
          inverseColor: '#ffffff'
        }
      },
      css: ({ dt }) => `
.p-button-accent {
    background: ${dt('button.accent.color')};
    color: ${dt('button.accent.inverse.color')};
    transition-duration: ${dt('my.transition.fast')};
}
`
    }
  },
  // common tokens and styles
  extend: {
    my: {
      transition: {
        slow: '0.75s',
        normal: '0.5s',
        fast: '0.25s'
      },
      imageDisplay: 'block'
    }
  },
  css: ({ dt }) => `
        /* Global CSS */
        img {
            display: ${dt('my.image.display')};
        }
    `
});
