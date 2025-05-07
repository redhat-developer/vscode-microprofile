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
import { RedHatService } from '@redhat-developer/vscode-redhat-telemetry';
import { CodeAction as VSCodeAction, CodeActionKind, Command as VSCommand, commands, Diagnostic as VSDiagnostic, ExtensionContext, extensions, window, workspace, TextDocument, FileCreateEvent } from 'vscode';
import { CancellationToken, CodeAction, CodeActionResolveRequest, Command, DidChangeConfigurationNotification, DocumentSelector, LanguageClientOptions, RequestType } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { APPLY_CODE_ACTION_WITH_TELEMETRY } from './definitions/commands';
import * as CommandKind from './definitions/lspCommandKind';
import * as MicroProfileLS from './definitions/microProfileLSRequestNames';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { collectMicroProfileJavaExtensions, handleExtensionChange, MicroProfileContribution } from './languageServer/plugin';
import { RequirementsData, resolveRequirements } from './languageServer/requirements';
import { registerConfigurationUpdateCommand, registerOpenURICommand } from './lsp-commands';
import { JAVA_EXTENSION_ID, ServerMode, waitForStandardMode } from './util/javaServerMode';
import { sendCodeActionTelemetry } from './util/telemetry';
import { getFilePathsFromWorkspace } from './util/workspaceUtils';
import { MicroProfilePropertiesChangeEvent, registerYamlSchemaSupport, YamlSchemaCache, getYamlSchemaCache } from './yaml/YamlSchema';

let languageClient: LanguageClient;

// alias for vscode-java's ExtensionAPI
export type JavaExtensionAPI = {
  serverReady(): Promise<void>,
  javaRequirement: Promise<RequirementsData>,
  serverMode: ServerMode,
  onDidServerModeChange(callback: (mode: string) => void);
};

export async function activate(context: ExtensionContext): Promise<void> {
  if (await isJavaProject()) {
    await doActivate(context);
  }
}

async function doActivate(context: ExtensionContext) {
  const redHatService: RedHatService = await getRedHatService(context);
  const telemetryService: TelemetryService = await redHatService.getTelemetryService();
  await telemetryService.sendStartupEvent();

  const yamlSchemaCache = getYamlSchemaCache();
  let yamlRegistered = false;

  /**
   * Register Yaml Schema support to manage appropriate yaml files if currently open in workspace
   */
  if (hasOpenedYamlConfig()) {
    registerYamlSchemaSupport();
    yamlRegistered = true;
  }

  /**
   * Monitor opened files to register Yaml Schema support if appropriate yaml file is opened
   */
  workspace.onDidOpenTextDocument((e: TextDocument) => {
    yamlRegistered = registerYamlSchemaSupportIfNeeded(e.fileName, yamlSchemaCache, yamlRegistered);
  });

  /**
   * Monitor created files to register Yaml Schema support if appropriate yaml file is created
   */
  workspace.onDidCreateFiles((e: FileCreateEvent) => {
    yamlRegistered = registerYamlSchemaSupportIfNeeded(e.files[0].fsPath, yamlSchemaCache, yamlRegistered);
  });

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
    bindRequest(MicroProfileLS.JAVA_WORKSPACE_SYMBOLS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_FILE_INFO_REQUEST);
    bindRequest(MicroProfileLS.JAVA_PROJECT_LABELS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_WORKSPACE_LABELS_REQUEST);

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

    /**
     * Registers a command that, given an LSP code action and a cancellation token:
     *
     * 1. Resolves the code action if necessary
     * 2. Runs command/applies workspace edit. If a code action provides
     *    an edit and a command, first the edit is executed and then the command,
     *    similar to how code actions are handled in the LSP specification.
     * 3. Sends telemetry if telemetry is enabled and the code action succeeds or fails
     */
    context.subscriptions.push(commands.registerCommand(APPLY_CODE_ACTION_WITH_TELEMETRY, async (lsCodeActionOrCommand: CodeAction | Command, resolvedEdit: boolean) => {
      let codeActionId: string | null = null;
      try {
        if (Command.is(lsCodeActionOrCommand)) {
          const command = lsCodeActionOrCommand as Command;
          codeActionId = command.command;
          await commands.executeCommand(command.command, ...command.arguments);
        } else {
          let lsCodeAction = lsCodeActionOrCommand as CodeAction;
          codeActionId = lsCodeAction.data?.id;
          if ((!resolvedEdit) && (!lsCodeAction.command)) {
            // resolve the code action
            lsCodeAction = await languageClient.sendRequest(CodeActionResolveRequest.type, lsCodeAction);
          }

          if (lsCodeAction.edit) {
            const vsCodeAction = await languageClient.protocol2CodeConverter.asCodeAction(lsCodeAction);
            await workspace.applyEdit(vsCodeAction.edit);
          }
          if (lsCodeAction.command) {
            if (!codeActionId) {
              codeActionId = lsCodeAction.command.command;
            }
            const vsCommand = languageClient.protocol2CodeConverter.asCommand(lsCodeAction.command);
            await commands.executeCommand(vsCommand.command, ...vsCommand.arguments);
          }
        }
        await sendCodeActionTelemetry(telemetryService, codeActionId || 'unknown', true);
      } catch (e) {
        await sendCodeActionTelemetry(telemetryService, codeActionId || 'unknown', false, e);
      }
    }));

  }).catch((error) => {
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
  });

  function bindRequest(request: string) {
    const requestType = new RequestType(request);
    languageClient.onRequest(requestType, async (params, token: CancellationToken) => {
      await api.serverReady();
      return commands.executeCommand(
        "java.execute.workspaceCommand",
        request,
        params,
        token
      );
    });
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

async function connectToLS(context: ExtensionContext, api: JavaExtensionAPI, documentSelector: DocumentSelector, microprofileContributions: MicroProfileContribution[]) {
  const requirements = await resolveRequirements(api);
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
          skipSendingJavaCompletionThroughLanguageServer: false
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
        didChangeConfiguration: async () => {
          languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getVSCodeMicroProfileSettings() });
        }
      },
      provideCodeActions: async (document, range, context, token, next): Promise<VSCodeAction[]> => {
        // Collect the code actions from the language server,
        // then rewrite them to execute the command "microprofile.applyCodeAction"
        // instead of whatever action was specified by the language server.
        // "microprofile.applyCodeAction" is a command that accepts a code action,
        // then applies it, then sends a telemetry event indicating which
        // code action was applied.
        return (await next(document, range, context, token))
          .map((vsCodeActionOrCommand) => {
            let kind: CodeActionKind = undefined;
            let diagnostics: VSDiagnostic[] = undefined;
            let edit = undefined;
            // As command arguments are JSON object,  code action / command from vscode
            // cannot be used as "microprofile.applyCodeAction" arguments because
            // it cannot be serialized as JSON correctly (some information are loosen like data, range, etc)
            // That's why "microprofile.applyCodeAction" arguments is filled with LSP code action /command.
            let lsCodeActionOrCommand: CodeAction | Command = undefined;
            if (Command.is(vsCodeActionOrCommand)) {
              // Get LSP command from the vscode command
              const vsCodeCommand: VSCommand = vsCodeActionOrCommand;
              lsCodeActionOrCommand = languageClient.code2ProtocolConverter.asCommand(vsCodeCommand);
            } else {
              // Get LSP code action from the vscode code action
              const vsCodeAction: VSCodeAction = vsCodeActionOrCommand;
              kind = vsCodeAction.kind;
              diagnostics = vsCodeAction.diagnostics;
              if (vsCodeAction.edit) {
                // When code action defines the edit, we return a code action with this vscode edit.
                // The apply workspace edit will be done by vscode himself and not by the command
                // "microprofile.applyCodeAction". In other words "microprofile.applyCodeAction" apply the
                // workspace edit only if edit must be resolved by the resolve code action.
                edit = vsCodeAction.edit;
                vsCodeAction.edit = undefined; // to avoid throwing error from https://github.com/microsoft/vscode-languageserver-node/blob/277e4564193c4ed258fe4d8d405d3379665bbab9/client/src/common/codeConverter.ts#L740
              }
              lsCodeActionOrCommand = languageClient.code2ProtocolConverter.asCodeActionSync(vsCodeAction);
            }
            const title = vsCodeActionOrCommand.title;
            return {
              title: title,
              command: {
                command: APPLY_CODE_ACTION_WITH_TELEMETRY,
                title: title,
                arguments: [lsCodeActionOrCommand, edit != undefined]
              },
              kind: kind,
              diagnostics: diagnostics,
              edit: edit
            }
          });
      }
    }
  };

  const serverOptions = prepareExecutable(requirements, getMicroProfileJarExtensions(microprofileContributions));

  languageClient = new LanguageClient('microprofile.tools', 'Tools for MicroProfile', serverOptions, clientOptions);
  await languageClient.start();

  if (extensions.onDidChange) {// Theia doesn't support this API yet
    context.subscriptions.push(extensions.onDidChange(() => {
      // if extensions that contribute mp java extensions change we need to reload the window
      handleExtensionChange(extensions.all);
    }));
  }

  /**
   * Returns a json object with key 'microprofile' and a json object value that
   * holds all microprofile settings.
   */
  function getVSCodeMicroProfileSettings(): { microprofile: unknown } {
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

/**
 * Returns if the given file name matches YAML config source file pattern.
 *
 * See https://download.eclipse.org/microprofile/microprofile-config-3.0/microprofile-config-spec-3.0.html#_on_config_source_level for an understanding of this pattern.
 *
 * @param fileName name of the file to be checked
 * @returns true if the file name is a match
 */
function isYamlConfigSource(fileName: string): boolean {
  return /application(-.*)?\.(yml|yaml)/.test(fileName);
}

/**
 * Returns if any of the open files in the workspace are YAML config sources
 *
 * @returns true if the above is true
 */
function hasOpenedYamlConfig(): boolean {
  return workspace.textDocuments.some(file => isYamlConfigSource(file.fileName));
}

/**
 * Registers YAML schema support if not already registered and if fileName is a config source.
 *
 * @param fileName the recently opened or created file to be checked
 * @param yamlSchemaCache
 * @param yamlRegistered indicates whether or not YAML support has already been registered
 * @returns true if YAML schema support was registered
 */
function registerYamlSchemaSupportIfNeeded(fileName: string, yamlSchemaCache: Promise<YamlSchemaCache>, yamlRegistered: boolean) {
  if (yamlRegistered == false && isYamlConfigSource(fileName)) {
    registerYamlSchemaSupport();
    return true;
  }
  return yamlRegistered;
}
