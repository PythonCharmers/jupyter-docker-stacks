import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * A plugin for pythoncharmers/jupyterlab_course_theme
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'pythoncharmers/jupyterlab_course_theme:plugin',
  requires: [IThemeManager],
  activate: function(app: JupyterFrontEnd, manager: IThemeManager) {
    const style = 'pythoncharmers/jupyterlab_course_theme/index.css';

    manager.register({
      name: 'jupyterlab_course_theme',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
