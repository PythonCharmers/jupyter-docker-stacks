import { Widget } from '@lumino/widgets';

import { toArray } from '@lumino/algorithm';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ABCWidgetFactory,
  DocumentRegistry,
  IDocumentWidget,
  DocumentWidget
} from '@jupyterlab/docregistry';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { folderIcon } from '@jupyterlab/ui-components';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

//const selectorItem = '.jp-DirListing-item[data-isdir]';
const selectorNotDir = '.jp-DirListing-item[data-isdir="false"]';

const SETTINGS_ID = 'open_in_vscode:open_in_vscode';


function buildVscodeServerUrl(): string {
    const vscodeServerPath = 'vscode-server';
    const currentUrl = new URL(window.location.href);
    const pathSegments = currentUrl.pathname.split('/');

    // Find the index of the user segment (assuming the format /user/{username}/...)
    const userSegmentIndex = pathSegments.findIndex(segment => segment === 'user');
    if (userSegmentIndex === -1 || userSegmentIndex + 1 >= pathSegments.length) {
        throw new Error('User segment not found in URL');
    }

    // Rebuild the base URL up to the username
    const baseUrlSegments = pathSegments.slice(0, userSegmentIndex + 2);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}/${baseUrlSegments.filter(Boolean).join('/')}`;

    // Construct the final URL
    const finalUrl = baseUrl.endsWith(vscodeServerPath) || baseUrl.endsWith(vscodeServerPath + '/') 
                     ? baseUrl 
                     : `${baseUrl}/${vscodeServerPath}`;

    return finalUrl;
}

/**
 * The command IDs.
 */
namespace CommandIDs {
  export const openFile = 'open_in_vscode:open_in_vscode';
}

export interface IResponse {
  /*
   * Whether the request was a success or not.
   */
  success: boolean;
}

/**
 * A widget that does not will to live.
 */
export class DummyWidget extends Widget {
  protected onAfterAttach(): void {
    this.parent?.dispose();
  }
}

export class FileOpenFactory extends ABCWidgetFactory<
  IDocumentWidget<DummyWidget>
> {
  /**
   * Create a new widget factory.
   */
  constructor(
    options: DocumentRegistry.IWidgetFactoryOptions<
      IDocumentWidget<DummyWidget>
    >,
    app: JupyterFrontEnd
  ) {
    super(options);

    this.app = app;
  }

  /**
   * Create a new widget given a context.
   */
  protected createNewWidget(
    context: DocumentRegistry.Context
  ): DocumentWidget<DummyWidget> {
    this.app.commands.execute(CommandIDs.openFile);

    return new DocumentWidget<DummyWidget>({
      context,
      content: new DummyWidget()
    });
  }

  private app: JupyterFrontEnd;
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'open_in_vscode:plugin',
  requires: [IFileBrowserFactory, ISettingRegistry],
  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    factory: IFileBrowserFactory,
    settings: ISettingRegistry
  ) => {
    Promise.all([app.restored, settings.load(SETTINGS_ID)]).then(
      ([, setting]) => {
        const widgetFactory = new FileOpenFactory(
          {
            name: 'FileOpen',
            modelName: 'base64',
            fileTypes: ['desktop'],
            defaultFor: ['desktop'],
            preferKernel: false,
            canStartKernel: false
          },
          app
        );

        const extensions = setting.get('extensions').composite as string[];

        app.docRegistry.addWidgetFactory(widgetFactory);

        app.docRegistry.addFileType({ name: 'desktop', extensions });
        app.docRegistry.setDefaultWidgetFactory('desktop', 'FileOpen');
      }
    );

    app.commands.addCommand(CommandIDs.openFile, {
      execute: () => {
        const widget = factory.tracker.currentWidget;

        if (widget) {
          const selection = toArray(widget.selectedItems());

          if (selection.length !== 1) {
            return;
          }

          const selected = selection[0];

          requestAPI<IResponse>('open-file', {
            method: 'POST',
            body: JSON.stringify({ path: selected.path })
          })
            .then(data => {
              // the server part worked properly, it means VSCode should've already opened the file,
              //  so lets just open a new tab where VSCode is
              let vscodeUrl = buildVscodeServerUrl();
              window.open(vscodeUrl.toString(), '_blank');
            })
            .catch(reason => {
              console.error(
                `The open_in_vscode server extension appears to be missing.\n${reason}`
              );
            });
        }
      },
      icon: folderIcon,  // TODO: add 
      label: 'Open With VSCode'
    });

    app.contextMenu.addItem({
      command: CommandIDs.openFile,
      selector: selectorNotDir,
      rank: 2
    });
  }
};

export default extension;
