import * as path from 'path';
import { isDeepStrictEqual } from 'util';
import * as vscode from 'vscode';
import { DocumentFilter, DocumentSelector, TextDocumentFilter } from 'vscode-languageclient';
import * as Commands from '../definitions/commands';

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
export function collectMicroProfileJavaExtensions(extensions: readonly vscode.Extension<unknown>[]): MicroProfileContribution[] {
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

export function handleExtensionChange(extensions: readonly vscode.Extension<unknown>[]): void  {
  if (!existingExtensions) {
    return;
  }
  const oldExtensions = new Set(existingExtensions.slice());
  const newExtensions = collectMicroProfileJavaExtensions(extensions);
  let hasChanged = (oldExtensions.size !== newExtensions.length);
  if (!hasChanged) {
    for (const newExtension of newExtensions) {
      let found = false;
      for (const oldExtension of oldExtensions) {
        if (isDeepStrictEqual(oldExtension, newExtension)) {
          found = true;
          break;
        }
      }
      if (found) {
        continue;
      } else {
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

function setJarExtensionsIfExists(obj: MicroProfileContribution, section: { jarExtensions: string[]; }, extensionPath: string): void {
  if (Array.isArray(section.jarExtensions)) {
    for (const microprofileJavaExtensionPath of section.jarExtensions) {
      obj.jarExtensions.push(path.resolve(extensionPath, microprofileJavaExtensionPath));
    }
  }
}

function setDocumentSelectorIfExists(obj: MicroProfileContribution, section: { documentSelector: (string | TextDocumentFilter)[]; }): void {
  if (!section.documentSelector || !Array.isArray(section.documentSelector)) {
    return;
  }
  const documentSelector: DocumentSelector = [];
  section.documentSelector.forEach((selector) => {
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
