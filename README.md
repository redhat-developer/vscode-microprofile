# MicroProfile Tools for Visual Studio Code

## Description

This Visual Studio Code extension provides support for [MicroProfile](https://github.com/eclipse/microprofile) development via:

 * a [MicroProfile language server](https://github.com/eclipse/lsp4mp/tree/master/microprofile.ls).
 * a [MicroProfile jdt.ls extension](https://github.com/eclipse/lsp4mp/tree/master/microprofile.jdt).

![](images/propertiesSupport.png)

## MicroProfile `properties` Features

In `microprofile-config.properties` files, you will benefit with:

  * Completion support for MicroProfile properties
  * Hover support for MicroProfile properties
  * Definition support for MicroProfile properties
  * Format support for MicroProfile properties
  * Validation and Quick Fix support for MicroProfile properties
  * Outline support (flat or tree view)

## MicroProfile `Java` Features

In `Java` files, you will benefit with:

  * Completion support for MicroProfile
  * Hover support for MicroProfile
  * Validation and Quick Fix support for MicroProfile
  * Code Lens support for MicroProfile
  * Code snippets

## Requirements

  * Java JDK (or JRE) 11 or more recent
  * [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java)

## Supported VS Code settings

The following settings are supported:

* `microprofile.tools.formatting.surroundEqualsWithSpaces` : Insert spaces around the equals sign when formatting the application.properties file. Default is `false`.
* `microprofile.tools.trace.server` : Trace the communication between VS Code and the MicroProfile Language Server in the Output view.
* `microprofile.tools.symbols.showAsTree` : Show MicroProfile properties as tree (Outline). Default is `true`.
* `microprofile.tools.validation.enabled` : Enables MicroProfile validation. Default is `true`.
* `microprofile.tools.validation.duplicate.severity` : Validation severity for duplicate properties for MicroProfile `*.properties` files.
Default is `warning`.
* `microprofile.tools.validation.syntax.severity` : Validation severity for property syntax checking for MicroProfile `*.properties` files.
Default is `error`.
* `microprofile.tools.validation.required.severity` : Validation severity for required properties for MicroProfile `*.properties` files.
Default is `none`.
* `microprofile.tools.validation.unknown.severity` : Validation severity for unknown properties for MicroProfile `*.properties` files. Default is `warning`.
* `microprofile.tools.validation.unknown.excluded` : Array of properties to ignore for unknown properties validation. Patterns can be used ('*' = any string, '?' = any character).
Default is `["*/mp-rest/providers/*/priority", "mp.openapi.schema.*"]`.
* `microprofile.tools.codeLens.urlCodeLensEnabled` : Enable/disable the URL code lenses for REST services. Default is`true`.
* `microprofile.tools.validation.value.severity`: Validation severity for property values for MicroProfile `*.properties` files. Default is `error`.

### **Note for MicroProfile Rest Client properties**:

Due to [this issue](https://github.com/redhat-developer/quarkus-ls/issues/203), the MP Rest property: `<mp-rest-client-class>/mp-rest/providers/<mp-rest-provider-class>/priority` reports an unknown error.

To avoid having this error, you must configure the following in `settings.json`:

```json
"microprofile.tools.validation.unknown.excluded": [
    "*/mp-rest/providers/*/priority"
]
```

This settings is set by default.

## Contributing

This is an open source project open to anyone. Contributions are extremely welcome!

For information on getting started, refer to the [CONTRIBUTING instructions](CONTRIBUTING.md).

CI builds can be installed manually by following these instructions:

  1) Download the latest development VSIX archive [from here](https://download.jboss.org/jbosstools/vscode/snapshots/vscode-microprofile/?C=M;O=D). `(vscode-microprofile-XXX.vsix)`

  2) Click `View/Command Palette`

  3) Type 'VSIX'

  4) Select 'Install from VSIX...' and choose the `.vsix` file.

## Feedback

File a bug in [GitHub Issues](https://github.com/redhat-developer/vscode-microprofile/issues).

## License

Apache License 2.0.
See [LICENSE](LICENSE) file.
