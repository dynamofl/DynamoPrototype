import { addons } from 'storybook/internal/manager-api';
import { dynamoTheme } from './dynamo-theme';

addons.setConfig({
  theme: dynamoTheme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
