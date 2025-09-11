import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    // Storybook 9.x built-in panels configuration
    actions: {},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: false, // Start collapsed for compact view
      sort: 'requiredFirst',
      // Compact layout with descriptions as tooltips
      disableSaveFromUI: false,
      presetColors: [],
      hideNoControlsWarning: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f0f0f',
        },
        {
          name: 'gray',
          value: '#f8f9fa',
        },
      ],
    },
    // Theme addon configuration
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: 'light', color: '#ffffff' },
        { name: 'dark', class: 'dark', color: '#0f0f0f' },
        { name: 'system', class: '', color: '#f8f9fa' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    // Layout configuration for direct stories
    layout: 'centered',
    // Options for better UX
    options: {
      storySort: {
        order: ['Introduction', 'Components', 'Patterns', 'Features'],
      },
    },
  },
  // Default args for consistent behavior
  args: {},
  // Direct stories without autodocs
  tags: [],

  // Consistent styling for all stories
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
        system: '',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;