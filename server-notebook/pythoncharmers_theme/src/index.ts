import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the pythoncharmers_theme extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'pythoncharmers_theme:plugin',
  description: 'A custom theme.',
  autoStart: true,
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log('JupyterLab extension pythoncharmers_theme is activated!');
    const style = 'pythoncharmers_theme/index.css';

    manager.register({
      name: 'pythoncharmers_theme',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default plugin;
