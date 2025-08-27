import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { TextDocumentFilter } from "vscode-languageclient";
import * as plugin from "../../../languageServer/plugin";
import { MicroProfileContribution } from "../../../languageServer/plugin";
import * as assert from 'assert/strict';

describe("Language server plugin", () => {
  it('Should collect lsp4mp extensions', () => {
    const quarkusPackageJSON = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../../../src/test/resources/quarkus-package.json"),
        "utf8"
      )
    );

    const fakeVscodeQuarkus: vscode.Extension<unknown> = {
      id: "fake-vscode-quarkus",
      extensionPath: "",
      extensionUri: vscode.Uri.parse("https://example.org"),
      isActive: true,
      packageJSON: quarkusPackageJSON,
      exports: "",
      activate: null,
      extensionKind: vscode.ExtensionKind.Workspace,
    };

    const noPluginPackageJSON = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../../../src/test/resources/no-lsp4mp-extension-package.json"),
        "utf8"
      )
    );

    const fakeNoPluginExtension: vscode.Extension<unknown> = {
      id: "fake-no-plugin-extension",
      extensionUri: vscode.Uri.parse("https://example.org"),
      extensionPath: "",
      isActive: true,
      packageJSON: noPluginPackageJSON,
      exports: "",
      activate: null,
      extensionKind: vscode.ExtensionKind.Workspace,
    };

    const extensions = [fakeVscodeQuarkus, fakeNoPluginExtension];
    const result: MicroProfileContribution[] = plugin.collectMicroProfileJavaExtensions(extensions);
    assert.equal(result.length, 1);

    assert.equal(result[0].jarExtensions.length, 1);

    const expectedPath: string = path.join('server', 'com.redhat.quarkus.ls.jar').replace("\\", "\\\\");
    assert.equal(typeof result[0].jarExtensions[0], "string");
    assert.ok(new RegExp(`${expectedPath}$`).test(result[0].jarExtensions[0]), `String should end with "${expectedPath}".`);

    assert.equal(result[0].documentSelector.length, 1);
    Object.keys(result[0].documentSelector[0]);
    assert.ok(Object.keys(result[0].documentSelector[0]).includes("scheme"));
    assert.ok(Object.keys(result[0].documentSelector[0]).includes("language"));

    const TextDocumentFilter: TextDocumentFilter = result[0].documentSelector[0] as TextDocumentFilter;
    assert.equal(typeof TextDocumentFilter.scheme, "string");
    assert.equal(TextDocumentFilter.scheme, "file");
    assert.equal(typeof TextDocumentFilter.language, "string");
    assert.equal(TextDocumentFilter.language, "quarkus-properties");
  });
});
