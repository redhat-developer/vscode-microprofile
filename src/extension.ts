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
import { getRedHatService, TelemetryService } from '@redhat-developer/vscode-redhat-telemetry/lib';
import { RedHatService } from '@redhat-developer/vscode-redhat-telemetry/lib/interfaces/redhatService';
import { commands, ExtensionContext, extensions, window, workspace } from 'vscode';
import { DidChangeConfigurationNotification, DocumentSelector, LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import * as CommandKind from './definitions/lspCommandKind';
import * as MicroProfileLS from './definitions/microProfileLSRequestNames';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { collectMicroProfileJavaExtensions, handleExtensionChange, MicroProfileContribution } from './languageServer/plugin';
import * as requirements from './languageServer/requirements';
import { registerConfigurationUpdateCommand, registerOpenURICommand } from './lsp-commands';
import { registerProviders } from './providers/microProfileProviders';
import { JAVA_EXTENSION_ID, waitForStandardMode } from './util/javaServerMode';
import { getFilePathsFromWorkspace } from './util/workspaceUtils';
import { MicroProfilePropertiesChangeEvent, registerYamlSchemaSupport } from './yaml/YamlSchema';

let languageClient: LanguageClient;

// alias for vscode-java's ExtensionAPI
export type JavaExtensionAPI = any;

export async function activate(context: ExtensionContext): Promise<void> {
  if (await isJavaProject()) {
    await doActivate(context);
  }
}

async function doActivate(context: ExtensionContext) {
  const redHatService: RedHatService = await getRedHatService(context);
  const telemetryService: TelemetryService = await redHatService.getTelemetryService();
  await telemetryService.sendStartupEvent();

  /**
   * Register Yaml Schema support to manage application.yaml
   */
  const yamlSchemaCache = registerYamlSchemaSupport();

  /**
   * Waits for the java language server to launch in standard mode
   * Before activating Tools for MicroProfile.
   * If java ls was started in lightweight mode, It will prompt user to switch
   */
  const api: JavaExtensionAPI = await getJavaExtensionAPI();
  await waitForStandardMode(api);

  const microprofileContributions: MicroProfileContribution[] = collectMicroProfileJavaExtensions(extensions.all);
  const documentSelector = getDocumentSelector(microprofileContributions);
  connectToLS(context, api, documentSelector, microprofileContributions).then(() => {
    yamlSchemaCache.then(cache => { if (cache) { cache.languageClient = languageClient; } });

    /**
     * Delegate requests from MicroProfile LS to the Java JDT LS
     */
    bindRequest(MicroProfileLS.PROJECT_INFO_REQUEST);
    bindRequest(MicroProfileLS.PROPERTY_DEFINITION_REQUEST);
    bindRequest(MicroProfileLS.PROPERTY_DOCUMENTATION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODEACTION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODEACTION_RESOLVE_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODELENS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_COMPLETION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_DEFINITION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_DIAGNOSTICS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_HOVER_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CURSOR_CONTEXT_REQUEST);
    bindRequest(MicroProfileLS.JAVA_FILE_INFO_REQUEST);
    bindRequest(MicroProfileLS.JAVA_PROJECT_LABELS_REQUEST);

    /**
     * Delegate notifications from Java JDT LS to the MicroProfile LS
     */
    context.subscriptions.push(commands.registerCommand(MicroProfileLS.PROPERTIES_CHANGED_NOTIFICATION, (event: MicroProfilePropertiesChangeEvent) => {
      languageClient.sendNotification(MicroProfileLS.PROPERTIES_CHANGED_NOTIFICATION, event);
      yamlSchemaCache.then(cache => {
        if (cache)
          cache.evict(event);
      });
    }));

    registerProviders(languageClient, documentSelector);

  }).catch((error) => {
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
  });

  function bindRequest(request: string) {
    languageClient.onRequest(request, async (params: any) => <any>await commands.executeCommand("java.execute.workspaceCommand", request, params)
    );
  }

  registerVSCodeCommands(context);
}

export async function deactivate(): Promise<void> {
  // language client may not have been started
  // if java language server was never launched in standard mode.
  if (languageClient) {
    await languageClient.stop();
  }
}

function registerVSCodeCommands(context: ExtensionContext) {
  /**
   * Register standard LSP commands
   */
  context.subscriptions.push(registerConfigurationUpdateCommand());
  context.subscriptions.push(registerOpenURICommand());
}

function connectToLS(context: ExtensionContext, api: JavaExtensionAPI, documentSelector: DocumentSelector, microprofileContributions: MicroProfileContribution[]) {
  return requirements.resolveRequirements(api).then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: documentSelector,
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
          },
          completion: {
            skipSendingJavaCompletionThroughLanguageServer: true
          },
          shouldLanguageServerExitOnShutdown: true
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

    languageClient = new LanguageClient('microprofile.tools', 'Tools for MicroProfile', serverOptions, clientOptions);
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

async function getJavaExtensionAPI(): Promise<JavaExtensionAPI> {
  const vscodeJava = extensions.getExtension(JAVA_EXTENSION_ID);
  if (!vscodeJava) {
    throw new Error("VSCode java is not installed");
  }

  const api = await vscodeJava.activate();
  if (!api) {
    throw new Error("VSCode java api not found");
  }

  return Promise.resolve(api);
}


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
    { scheme: 'file', language: 'java' },
    { scheme: 'file', language: 'microprofile-properties' }
  ];
  microProfileContributions.forEach((contribution: MicroProfileContribution) => {
    documentSelector = documentSelector.concat(contribution.documentSelector);
  });
  return documentSelector;
}

/**
 * Returns if any workspace folder contains a build.gradle, pom.xml, or .project.
 *
 * @returns true if any workspace folder contains a build.gradle, pom.xml, or .project
 */
async function isJavaProject(): Promise<boolean> {
  if (!workspace.workspaceFolders) {
    return false;
  }
  for (const ws of workspace.workspaceFolders) {
    const buildFileUris = await getFilePathsFromWorkspace(
      ws,
      "**/{pom.xml,build.gradle,.project}"
    );
    if (buildFileUris.length) {
      return true;
    }
  }
  return false;
}
