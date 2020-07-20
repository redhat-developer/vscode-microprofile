import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as plugin from "../../../languageServer/plugin";
import { expect } from "chai";
import { MicroProfileContribution } from "../../../languageServer/plugin";
import { DocumentFilter } from "vscode-languageclient";

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
    const result: MicroProfileContribution[] = plugin.collectMicroProfileJavaExtensions(extensions);
    expect(result).to.have.length(1);

    expect(result[0].jarExtensions).to.have.length(1);

    const expectedPath: string = './server/com.redhat.quarkus.ls.jar';
    expect(result[0].jarExtensions[0]).to.be.a("string").and.match(new RegExp(`${expectedPath}$`), `String should end with "${expectedPath}".`);

    expect(result[0].documentSelector).to.have.length(1);
    expect(result[0].documentSelector[0]).has.all.keys(["scheme", "language"]);

    const documentFilter: DocumentFilter = result[0].documentSelector[0] as DocumentFilter;
    expect(documentFilter.scheme).to.be.a("string").and.equal("file");
    expect(documentFilter.language).to.be.a("string").and.equal("quarkus-properties");
  });
});
