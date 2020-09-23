import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * A plugin for pythoncharmers/charmerstheme
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@pythoncharmers/charmerstheme:plugin',
  requires: [IThemeManager],
  activate: function(app: JupyterFrontEnd, manager: IThemeManager) {
    const style = '@pythoncharmers/charmerstheme/index.css';

    manager.register({
      name: 'charmerstheme',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
