import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from '../definitions/constants';

let existingExtensions: Array<string>;

export function collectMicroProfileJavaExtensions(extensions: readonly vscode.Extension<any>[]): string[] {
  const result = [];
  if (extensions && extensions.length) {
    for (const extension of extensions) {
      const contributesSection = extension.packageJSON.contributes;
      if (contributesSection) {
        const microprofileSection = contributesSection.microprofile;
        if (microprofileSection && Array.isArray(microprofileSection.jarExtensions)) {
          for (const microprofileJavaExtensionPath of microprofileSection.jarExtensions) {
            result.push(path.resolve(extension.extensionPath, microprofileJavaExtensionPath));
          }
        }
      }
    }
  }
  // Make a copy of extensions:
  existingExtensions = result.slice();
  return result;
}

export function handleExtensionChange(extensions: readonly vscode.Extension<any>[]) {
  if (!existingExtensions) {
    return;
  }
  const oldExtensions = new Set(existingExtensions.slice());
  const newExtensions = collectMicroProfileJavaExtensions(extensions);
  let hasChanged = (oldExtensions.size !== newExtensions.length);
  if (!hasChanged) {
    for (const newExtension of newExtensions) {
      if (!oldExtensions.has(newExtension)) {
        hasChanged = true;
        break;
      }
    }
  }

  if (hasChanged) {
    const msg = `Extensions to the MicroProfile Language Server changed, reloading ${vscode.env.appName} is required for the changes to take effect.`;
    const action = 'Reload';
    vscode.window.showWarningMessage(msg, action).then((selection) => {
      if (action === selection) {
        vscode.commands.executeCommand(Commands.RELOAD_WINDOW);
      }
    });
  }
}