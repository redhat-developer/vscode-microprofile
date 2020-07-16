import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as plugin from "../../../languageServer/plugin";
import { expect } from "chai";

describe("Language server plugin", () => {
  it('Should collect lsp4mp extensions', () => {
    const quarkusPackageJSON = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../../../src/test/resources/quarkus-package.json"),
        "utf8"
      )
    );

    const fakeVscodeQuarkus: vscode.Extension<any> = {
      id: "fake-vscode-quarkus",
      extensionPath: "",
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

    const fakeNoPluginExtension: vscode.Extension<any> = {
      id: "fake-no-plugin-extension",
      extensionPath: "",
      isActive: true,
      packageJSON: noPluginPackageJSON,
      exports: "",
      activate: null,
      extensionKind: vscode.ExtensionKind.Workspace,
    };

    const extensions = [fakeVscodeQuarkus, fakeNoPluginExtension];
    const result = plugin.collectMicroProfileJavaExtensions(extensions);
    expect(result).to.have.length(1);
  });
});
