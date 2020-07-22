import * as vscode from 'vscode';
import * as path from 'path';
import { Commands } from '../definitions/constants';
import { DocumentFilter, DocumentSelector } from 'vscode-languageclient';

let existingExtensions: MicroProfileContribution[];

/**
 * MicroProfile language server contribution
 */
export interface MicroProfileContribution {
  jarExtensions: string[];
  documentSelector: DocumentSelector;
}

/**
 * Returns all MicroProfile language server contributions from package.json
 *
 * @param extensions array of extensions to search contributions from
 */
export function collectMicroProfileJavaExtensions(extensions: readonly vscode.Extension<any>[]): MicroProfileContribution[] {
  const result: MicroProfileContribution[] = [];
  if (extensions && extensions.length) {
    for (const extension of extensions) {
      const contributesSection = extension.packageJSON.contributes;
      if (contributesSection && contributesSection.microprofile) {
        const microprofileSection = contributesSection.microprofile;
        const contributes: MicroProfileContribution = {jarExtensions: [], documentSelector: []};

        setJarExtensionsIfExists(contributes, microprofileSection, extension.extensionPath);
        setDocumentSelectorIfExists(contributes, microprofileSection);

        if (contributes.jarExtensions || contributes.documentSelector) {
          result.push(contributes);
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

function setJarExtensionsIfExists(obj: MicroProfileContribution, section: any, extensionPath: string): void {
  if (Array.isArray(section.jarExtensions)) {
    for (const microprofileJavaExtensionPath of section.jarExtensions) {
      obj.jarExtensions.push(path.resolve(extensionPath, microprofileJavaExtensionPath));
    }
  }
}

function setDocumentSelectorIfExists(obj: MicroProfileContribution, section: any): void {
  if (!Array.isArray(section.documentSelector)) {
    return;
  }
  const documentSelector: DocumentSelector = [];
  section.documentSelector.forEach((selector: any) => {
    if (typeof selector === 'string') {
      documentSelector.push(selector);
    } else if (selector) {
      const documentFilter: {[key: string]: string} = {};
      if (typeof selector.language === 'string') {
        documentFilter.language = selector.language;
      }
      if (typeof selector.scheme === 'string') {
        documentFilter.scheme = selector.scheme;
      }
      if (typeof selector.pattern === 'string') {
        documentFilter.pattern = selector.pattern;
      }
      if (documentFilter.language || documentFilter.scheme || documentFilter.pattern) {
        documentSelector.push(documentFilter as DocumentFilter);
      }
    }
  });
  obj.documentSelector = obj.documentSelector.concat(documentSelector);
}