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
import { DidChangeConfigurationNotification, LanguageClientOptions, LanguageClient } from 'vscode-languageclient';
import { ExtensionContext, commands, window, workspace, extensions } from 'vscode';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { registerConfigurationUpdateCommand, registerOpenURICommand, CommandKind } from './lsp-commands';
import { registerYamlSchemaSupport, MicroProfilePropertiesChangeEvent } from './yaml/YamlSchema';
import { collectMicroProfileJavaExtensions, handleExtensionChange } from './languageServer/plugin';

let languageClient: LanguageClient;

export function activate(context: ExtensionContext) {

  /**
   * Register Yaml Schema support to manage application.yaml
   */
  const yamlSchemaCache = registerYamlSchemaSupport();

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
}

function registerVSCodeCommands(context: ExtensionContext) {
  /**
   * Register standard LSP commands
   */
  context.subscriptions.push(registerConfigurationUpdateCommand());
  context.subscriptions.push(registerOpenURICommand());
}

function connectToLS(context: ExtensionContext) {
  return requirements.resolveRequirements().then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'microprofile-properties' },
        { scheme: 'file', language: 'quarkus-properties' },
        { scheme: 'file', language: 'java' }
      ],
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

    const microprofileJavaExtensions = collectMicroProfileJavaExtensions(extensions.all);
    const serverOptions = prepareExecutable(requirements, microprofileJavaExtensions);

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
}
