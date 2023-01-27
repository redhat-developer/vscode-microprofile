import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { TextDocumentFilter } from "vscode-languageclient";
import * as plugin from "../../../languageServer/plugin";
import { MicroProfileContribution } from "../../../languageServer/plugin";

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

    const fakeNoPluginExtension: vscode.Extension<any> = {
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
    expect(result).to.have.length(1);

    expect(result[0].jarExtensions).to.have.length(1);

    const expectedPath: string = path.join('server', 'com.redhat.quarkus.ls.jar').replace("\\", "\\\\");
    expect(result[0].jarExtensions[0]).to.be.a("string").and.match(new RegExp(`${expectedPath}$`), `String should end with "${expectedPath}".`);

    expect(result[0].documentSelector).to.have.length(1);
    expect(result[0].documentSelector[0]).has.all.keys(["scheme", "language"]);

    const TextDocumentFilter: TextDocumentFilter = result[0].documentSelector[0] as TextDocumentFilter;
    expect(TextDocumentFilter.scheme).to.be.a("string").and.equal("file");
    expect(TextDocumentFilter.language).to.be.a("string").and.equal("quarkus-properties");
  });
});
