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
import * as assert from "assert";
import { MicroProfileContribution } from "../../../languageServer/plugin";
import { TextDocumentFilter, DocumentSelector } from "vscode-languageclient";

/**
 * This file ensures that DocumentSelectors contributed by other VS Code extensions
 * (using `contributes.microprofile.documentSelector` key within package.json) are being
 * collected correctly.
 */
describe("Document selector collection from language server plugins", () => {

  it ('Should collect document selector when all keys exist', () => {
    const selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file", language: "quarkus-properties", pattern: "**/*.properties" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.ok(Object.keys(selector[0]).includes("language"));
    assert.ok(Object.keys(selector[0]).includes("pattern"));
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");
    assert.equal((selector[0] as TextDocumentFilter).language, "quarkus-properties");
    assert.equal((selector[0] as TextDocumentFilter).pattern, "**/*.properties");
  });

  it ('Should collect all document selector when two keys exist', () => {
    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file", language: "quarkus-properties" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.ok(Object.keys(selector[0]).includes("language"));
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");
    assert.equal((selector[0] as TextDocumentFilter).language, "quarkus-properties");

    selector = collectDocumentSelectors([{ language: "quarkus-properties", pattern: "**/*.properties" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("language"));
    assert.ok(Object.keys(selector[0]).includes("pattern"));
    assert.equal((selector[0] as TextDocumentFilter).language, "quarkus-properties");
    assert.equal((selector[0] as TextDocumentFilter).pattern, "**/*.properties");

    selector = collectDocumentSelectors([{ pattern: "**/*.properties", scheme: "file" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("pattern"));
    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.equal((selector[0] as TextDocumentFilter).pattern, "**/*.properties");
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");
  });

  it ('Should collect document selector when one key exist', () => {
    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");

    selector = collectDocumentSelectors([{ language: "quarkus-properties" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("language"));
    assert.equal((selector[0] as TextDocumentFilter).language, "quarkus-properties");

    selector = collectDocumentSelectors([{ pattern: "**/*.properties" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("pattern"));
    assert.equal((selector[0] as TextDocumentFilter).pattern, "**/*.properties");
  });

  it ('Should collect document selector when a valid key and an invalid key exists', () => {
    // valid, but the "invalid" key is ignored
    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: "file", invalid: "file" }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");

    // valid, but the "language" key is ignored since the value has the wrong type
    selector = collectDocumentSelectors([{ scheme: "file", language: 12 }]);
    assert.equal(selector.length, 1);
    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");
  });

  it ('Should collect document selector strings', () => {
    const selector: DocumentSelector = collectDocumentSelectors(["document-selector-string"]);
    assert.equal(selector.length, 1);
    assert.equal(typeof selector[0], "string");
    assert.equal(selector[0], "document-selector-string")
  });

  it ('Should not collect document selector when there are no correct keys', () => {
    let selector: DocumentSelector = collectDocumentSelectors([{ invalid: "file" }]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([{}]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([]);
    assert.equal(selector.length, 0);
  });

  it ('Should not collect document selector when containing invalid types', () => {
    let selector: DocumentSelector = collectDocumentSelectors([12]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([/test/]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([true]);
    assert.equal(selector.length, 0);
  });

  it ('Should not collect document selector when all keys have incorrect types', () => {

    let selector: DocumentSelector = collectDocumentSelectors([{ scheme: 12 }]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([{ scheme: { key: "value" } }]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([{ language: 12 }]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([{ language: { key: "value" } }]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([{ pattern: 12 }]);
    assert.equal(selector.length, 0);

    selector = collectDocumentSelectors([{ pattern: { key: "value" } }]);
    assert.equal(selector.length, 0);
  });

  it ('Should collect multiple document selectors', () => {
    const selector: DocumentSelector = collectDocumentSelectors([
      { scheme: "file", language: "quarkus-properties", pattern: "**/*.properties" }, // valid
      { language: "my-properties" }, // valid
      "document-selector-string", // valid
      { key: "value" }, // invalid
      12 // invalid
    ]);

    assert.equal(selector.length, 3);

    assert.ok(Object.keys(selector[0]).includes("scheme"));
    assert.ok(Object.keys(selector[0]).includes("language"));
    assert.ok(Object.keys(selector[0]).includes("pattern"));
    assert.equal((selector[0] as TextDocumentFilter).scheme, "file");
    assert.equal((selector[0] as TextDocumentFilter).language, "quarkus-properties");
    assert.equal((selector[0] as TextDocumentFilter).pattern, "**/*.properties");

    assert.ok(Object.keys(selector[1]).includes("language"));
    assert.equal((selector[1] as TextDocumentFilter).language, "my-properties");

    assert.equal(typeof selector[2], "string");
    assert.equal(selector[2], "document-selector-string");
  });

  /**
   * Returns the DocumentSelector created from the provided `pluginDocumentSelector`.
   *
   * `pluginDocumentSelector` represents the DocumentSelector that other VS Code
   * extensions would contribute to vscode-microprofile.
   *
   * @param pluginDocumentSelector array of objects to create a DocumentSelector from.
   */
  function collectDocumentSelectors(pluginDocumentSelector: unknown[]): DocumentSelector {
    const fakePlugin: vscode.Extension<unknown> = {
      id: "fake-no-plugin-extension",
      extensionUri: vscode.Uri.parse("https://example.org"),
      extensionPath: "",
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
    assert.equal(contribution.length, 1);

    return contribution[0].documentSelector;
  }
});
