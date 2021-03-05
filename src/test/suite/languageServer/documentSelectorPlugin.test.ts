/**
 * Copyright 2020 Red Hat, Inc. and others.

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
import * as vscode from "vscode";
import * as plugin from "../../../languageServer/plugin";
import { expect } from "chai";
import { MicroProfileContribution } from "../../../languageServer/plugin";
import { DocumentFilter, DocumentSelector } from "vscode-languageclient";

/**
 * This file ensures that DocumentSelectors contributed by other VS Code extensions
 * (using `contributes.microprofile.documentSelector` key within package.json) are being
 * collected correctly.
 */
describe("Document selector collection from language server plugins", () => {

  it ('Should collect document selector when all keys exist', () => {
    const selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file", language: "quarkus-properties", pattern: "**/*.properties" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["scheme", "language", "pattern"]);
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");
    expect((selector[0] as DocumentFilter).language).to.equal("quarkus-properties");
    expect((selector[0] as DocumentFilter).pattern).to.equal("**/*.properties");
  });

  it ('Should collect all document selector when two keys exist', () => {
    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file", language: "quarkus-properties" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["scheme", "language"]);
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");
    expect((selector[0] as DocumentFilter).language).to.equal("quarkus-properties");

    selector = collectDocumentSelectors([{ language: "quarkus-properties", pattern: "**/*.properties" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["language", "pattern"]);
    expect((selector[0] as DocumentFilter).language).to.equal("quarkus-properties");
    expect((selector[0] as DocumentFilter).pattern).to.equal("**/*.properties");

    selector = collectDocumentSelectors([{ pattern: "**/*.properties", scheme: "file" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["pattern", "scheme"]);
    expect((selector[0] as DocumentFilter).pattern).to.equal("**/*.properties");
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");
  });

  it ('Should collect document selector when one key exist', () => {
    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["scheme"]);
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");

    selector = collectDocumentSelectors([{ language: "quarkus-properties" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["language"]);
    expect((selector[0] as DocumentFilter).language).to.equal("quarkus-properties");

    selector = collectDocumentSelectors([{ pattern: "**/*.properties" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["pattern"]);
    expect((selector[0] as DocumentFilter).pattern).to.equal("**/*.properties");
  });

  it ('Should collect document selector when a valid key and an invalid key exists', () => {
    // valid, but the "invalid" key is ignored
    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file", invalid: "file" }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["scheme"]);
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");

    // valid, but the "language" key is ignored since the value has the wrong type
    selector = collectDocumentSelectors([{ scheme: "file", language: 12 }]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.have.all.keys(["scheme"]);
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");
  });

  it ('Should collect document selector strings', () => {
    const selector: DocumentSelector = collectDocumentSelectors(["document-selector-string"]);
    expect(selector).to.have.length(1);
    expect(selector[0]).to.be.a('string');
    expect(selector[0]).to.equal("document-selector-string");
  });

  it ('Should not collect document selector when there are no correct keys', () => {
    let selector: DocumentSelector = collectDocumentSelectors([{ invalid: "file" }]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([{}]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([]);
    expect(selector).to.have.length(0);
  });

  it ('Should not collect document selector when containing invalid types', () => {
    let selector: DocumentSelector = collectDocumentSelectors([12]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([/test/]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([true]);
    expect(selector).to.have.length(0);
  });

  it ('Should not collect document selector when all keys have incorrect types', () => {

    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: 12 }]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([{ scheme: { key: "value" } }]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([{ language: 12 }]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([{ language: { key: "value" } }]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([{ pattern: 12 }]);
    expect(selector).to.have.length(0);

    selector = collectDocumentSelectors([{ pattern: { key: "value" } }]);
    expect(selector).to.have.length(0);
  });

  it ('Should collect multiple document selectors', () => {
    const selector: DocumentSelector = collectDocumentSelectors([
      { scheme: "file", language: "quarkus-properties", pattern: "**/*.properties" }, // valid
      { language: "my-properties" }, // valid
      "document-selector-string", // valid
      { key: "value" }, // invalid
      12 // invalid
    ]);

    expect(selector).to.have.length(3);

    expect(selector[0]).to.have.all.keys(["scheme", "language", "pattern"]);
    expect((selector[0] as DocumentFilter).scheme).to.equal("file");
    expect((selector[0] as DocumentFilter).language).to.equal("quarkus-properties");
    expect((selector[0] as DocumentFilter).pattern).to.equal("**/*.properties");

    expect(selector[1]).to.have.all.keys(["language"]);
    expect((selector[1] as DocumentFilter).language).to.equal("my-properties");

    expect(selector[2]).to.be.a('string');
    expect(selector[2]).to.equal("document-selector-string");
  });

  /**
   * Returns the DocumentSelector created from the provided `pluginDocumentSelector`.
   *
   * `pluginDocumentSelector` represents the DocumentSelector that other VS Code
   * extensions would contribute to vscode-microprofile.
   *
   * @param pluginDocumentSelector array of objects to create a DocumentSelector from.
   */
  function collectDocumentSelectors(pluginDocumentSelector: any[]): DocumentSelector {
    const fakePlugin: vscode.Extension<any> = {
      id: "fake-no-plugin-extension",
      extensionPath: "",
      extensionUri: vscode.Uri.parse("http://example.org"),
      isActive: true,
      packageJSON: {
        contributes: {
          microprofile: {
            documentSelector: pluginDocumentSelector
          }
        }
      },
      exports: "",
      activate: null,
      extensionKind: vscode.ExtensionKind.Workspace,
    };

    const contribution: MicroProfileContribution[] = plugin.collectMicroProfileJavaExtensions([ fakePlugin ]);
    expect(contribution).to.have.length(1);

    const selector: DocumentSelector = contribution[0].documentSelector;
    return contribution[0].documentSelector;
  }
});
