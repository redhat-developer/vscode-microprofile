/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as requirements from './languageServer/requirements';

import { MicroProfileLS } from './definitions/constants';
import { DidChangeConfigurationNotification, LanguageClientOptions, LanguageClient, DocumentSelector } from 'vscode-languageclient';
import { ExtensionContext, commands, window, workspace, extensions } from 'vscode';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { registerConfigurationUpdateCommand, registerOpenURICommand, CommandKind } from './lsp-commands';
import { registerYamlSchemaSupport, MicroProfilePropertiesChangeEvent } from './yaml/YamlSchema';
import { collectMicroProfileJavaExtensions, handleExtensionChange, MicroProfileContribution } from './languageServer/plugin';
import { waitForStandardMode } from './util/javaServerMode';

let languageClient: LanguageClient;

export async function activate(context: ExtensionContext) {

  /**
   * Register Yaml Schema support to manage application.yaml
   */
  const yamlSchemaCache = registerYamlSchemaSupport();

  /**
   * Waits for the java language server to launch in standard mode
   * Before activating MicroProfile tools.
   * If java ls was started in lightweight mode, It will prompt user to switch
   */
  await waitForStandardMode();

  connectToLS(context).then(() => {
    yamlSchemaCache.then(cache => { if (cache) { cache.languageClient = languageClient; } });

    /**
     * Delegate requests from MicroProfile LS to the Java JDT LS
     */
    bindRequest(MicroProfileLS.PROJECT_INFO_REQUEST);
    bindRequest(MicroProfileLS.PROPERTY_DEFINITION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODEACTION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODELENS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_COMPLETION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_DIAGNOSTICS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_HOVER_REQUEST);
    bindRequest(MicroProfileLS.JAVA_FILE_INFO_REQUEST);
    bindRequest(MicroProfileLS.JAVA_PROJECT_LABELS_REQUEST);

    /**
     * Delegate notifications from Java JDT LS to the MicroProfile LS
     */
    context.subscriptions.push(commands.registerCommand(MicroProfileLS.PROPERTIES_CHANGED_NOTIFICATION, (event: MicroProfilePropertiesChangeEvent) => {
      languageClient.sendNotification(MicroProfileLS.PROPERTIES_CHANGED_NOTIFICATION, event);
      yamlSchemaCache.then(cache => { if (cache) cache.evict(event); });
    }));
  }).catch((error) => {
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
  });

  function bindRequest(request: string) {
    languageClient.onRequest(request, async (params: any) =>
      <any>await commands.executeCommand("java.execute.workspaceCommand", request, params)
    );
  }

  registerVSCodeCommands(context);
}

export function deactivate() {
  // language client may not have been started
  // if java language server was never launched in standard mode.
  if (languageClient) {
    languageClient.stop();
  }
}

function registerVSCodeCommands(context: ExtensionContext) {
  /**
   * Register standard LSP commands
   */
  context.subscriptions.push(registerConfigurationUpdateCommand());
  context.subscriptions.push(registerOpenURICommand());
}

function connectToLS(context: ExtensionContext) {
  const microprofileContributions: MicroProfileContribution[] = collectMicroProfileJavaExtensions(extensions.all);
  return requirements.resolveRequirements().then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: getDocumentSelector(microprofileContributions),
      // wrap with key 'settings' so it can be handled same a DidChangeConfiguration
      initializationOptions: {
        settings: getVSCodeMicroProfileSettings(),
        extendedClientCapabilities: {
          commands: {
            commandsKind: {
              valueSet: [
                CommandKind.COMMAND_CONFIGURATION_UPDATE,
                CommandKind.COMMAND_OPEN_URI
              ]
            }
          }
        }
      },
      synchronize: {
        // preferences starting with these will trigger didChangeConfiguration
        configurationSection: ['microprofile', '[microprofile]']
      },
      middleware: {
        workspace: {
          didChangeConfiguration: () => {
            languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getVSCodeMicroProfileSettings() });
          }
        }
      }
    };

    const serverOptions = prepareExecutable(requirements, getMicroProfileJarExtensions(microprofileContributions));

    languageClient = new LanguageClient('microprofile.tools', 'MicroProfile Tools', serverOptions, clientOptions);
    context.subscriptions.push(languageClient.start());

    if (extensions.onDidChange) {// Theia doesn't support this API yet
      context.subscriptions.push(extensions.onDidChange(() => {
        // if extensions that contribute mp java extensions change we need to reload the window
        handleExtensionChange(extensions.all);
      }));
    }

    return languageClient.onReady();
  });

  /**
   * Returns the document selector.
   *
   * The returned document selector contains the microprofile-properties and java document selectors
   * and all document selectors contained in `microProfileContributions`.
   *
   * @param microProfileContributions MicroProfile language server contributions from other VS Code extensions
   */
  function getDocumentSelector(microProfileContributions: MicroProfileContribution[]): DocumentSelector {
    let documentSelector: DocumentSelector = [
      { scheme: 'file', language: 'microprofile-properties' },
      { scheme: 'file', language: 'java' }
    ];
    microProfileContributions.forEach((contribution: MicroProfileContribution) => {
      documentSelector = documentSelector.concat(contribution.documentSelector);
    });
    return documentSelector;
  }

  /**
   * Returns a json object with key 'microprofile' and a json object value that
   * holds all microprofile settings.
   */
  function getVSCodeMicroProfileSettings(): { microprofile: any } {
    const defaultMicroProfileSettings = {};
    const configMicroProfile = workspace.getConfiguration().get('microprofile');
    const microprofileSettings = configMicroProfile ? configMicroProfile : defaultMicroProfileSettings;

    return {
      microprofile: microprofileSettings,
    };
  }

  /**
   * Returns an array of paths to MicroProfileLS extension jars within `microProfileContributions`
   *
   * @param microProfileContributions MicroProfile language server contributions from other VS Code extensions
   */
  function getMicroProfileJarExtensions(microProfileContributions: MicroProfileContribution[]): string[] {
    let jarPaths: string[] = [];
    microProfileContributions.forEach((contribution: MicroProfileContribution) => {
      if (contribution.jarExtensions && contribution.jarExtensions.length > 0) {
        jarPaths = jarPaths.concat(contribution.jarExtensions);
      }
    });
    return jarPaths;
  }
}
