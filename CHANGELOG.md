# Tools for MicroProfile Changelog

## [0.2.0](https://github.com/redhat-developer/vscode-microprofile/milestone/2?closed=1) (April 7, 2021)

### Enhancements

 * Support arbitrary number of member values in `PropertiesHoverParticipant`. See [eclipse/lsp4mp#124](https://github.com/eclipse/lsp4mp/pull/124).
 * Add extension point to contribute properties to exclude from validation. See [eclipse/lsp4mp#95](https://github.com/eclipse/lsp4mp/issues/95).
 * Definition support from Java to properties for `ConfigProperty/name`. See [eclipse/lsp4mp#88](https://github.com/eclipse/lsp4mp/issues/88).
 * Automatically infer package names when inserting class snippets. See [eclipse/lsp4mp#60](https://github.com/eclipse/lsp4mp/issues/60).
 * Support `handle-as` for metadata properties. See [eclipse/lsp4mp#39](https://github.com/eclipse/lsp4mp/issues/39).
 * Display the different values for the different profiles in Java `@ConfigProperty` Hover. See [eclipse/lsp4mp#98](https://github.com/eclipse/lsp4mp/issues/98).
 * Add startup and shutdown telemetry. See [#46](https://github.com/redhat-developer/vscode-microprofile/issues/46)

### Bug Fixes

 * Wait for the language server to stop before exiting. See [#39](https://github.com/redhat-developer/vscode-microprofile/issues/39).
 * Trailing tab causes infinite loop in parser. See [eclipse/lsp4mp#112](https://github.com/eclipse/lsp4mp/issues/112).
 * Prevent NPEs when working with MP 4.0 features. See [eclipse/lsp4mp#119](https://github.com/eclipse/lsp4mp/issues/119).
 * Enhance the error message when out of bounds is detected. See [eclipse/lsp4mp#114](https://github.com/eclipse/lsp4mp/pull/114).
 * Use `kill -0` instead of `ps -p` in `ParentProcessWatcher`. See [eclipse/lsp4mp#110](https://github.com/eclipse/lsp4mp/issues/110).
 * Wrong/Missing Log Levels in property files. See [eclipse/lsp4mp#15](https://github.com/eclipse/lsp4mp/pull/105).
 * `mp.messaging` properties now work for Emitters. See [eclipse/lsp4mp#127](https://github.com/eclipse/lsp4mp/pull/127).

## [0.1.1] (September 23, 2020)
* Update name to "Tools for MicroProfile". See [#23](https://github.com/redhat-developer/vscode-microprofile/issues/23)

## [0.1.0](https://github.com/redhat-developer/vscode-microprofile/milestone/1?closed=1) (September 21, 2020)

### Enhancements

 * Add new setting for property expression validation. See [#18](https://github.com/redhat-developer/vscode-microprofile/pull/18).
 * Update extension displayName to MicroProfile Tools. See [#9](https://github.com/redhat-developer/vscode-microprofile/pull/9).
 * Remove quarkus-properties language and collect document selectors from extensions. See [#8](https://github.com/redhat-developer/vscode-microprofile/pull/8).
 * Java snippets for `microprofile rest client`. See [lsp4mp#55](https://github.com/eclipse/lsp4mp/issues/55).
 * CDI scope diagnostics for `mp metrics @Gauge`. See [lsp4mp#46](https://github.com/eclipse/lsp4mp/issues/46).
 * Highlight support for property expression. See [lsp4mp#40](https://github.com/eclipse/lsp4mp/issues/40).
 * Diagnostics for ` mp-fault-tolerance fallbackMethod` . See [lsp4mp#33](https://github.com/eclipse/lsp4mp/issues/33).
 * Java `snippets for jax-rs`. See [lsp4mp#31](https://github.com/eclipse/lsp4mp/issues/31).
 * Snippets for new `microprofile health liveness / readiness checks`. See [lsp4mp#28](https://github.com/eclipse/lsp4mp/issues/28).
 * Properties support for `microprofile-graphql`. See [lsp4mp#27](https://github.com/eclipse/lsp4mp/issues/27).
 * Properties support for `microprofile-reactive-messaging`. See [lsp4mp#26](https://github.com/eclipse/lsp4mp/issues/26).
 * Hover for Property Expressions. See [lsp4mp#24](https://github.com/eclipse/lsp4mp/issues/24).
 * Properties support for microprofile-jwt-auth. See [lsp4mp#23](https://github.com/eclipse/lsp4mp/issues/23).
 * Property expression validation. See [lsp4mp#21](https://github.com/eclipse/lsp4mp/pull/21).
 * Property expression definition. See [lsp4mp#19](https://github.com/eclipse/lsp4mp/pull/19).
 * Hardcoded support for boolean converter. See [lsp4mp#17](https://github.com/eclipse/lsp4mp/pull/17).
 * Properties support for `microprofile-health`. See [lsp4mp#16](https://github.com/eclipse/lsp4mp/issues/16).
 * Model and completion for property expressions. See [lsp4mp#13](https://github.com/eclipse/lsp4mp/pull/13).

### Bug Fixes

 * Ensure language server is stopped when extension is deactivated. See [#16](https://github.com/redhat-developer/vscode-microprofile/pull/16).
 * Ensure microprofile ls process is terminated on deactivate. See [#15](https://github.com/redhat-developer/vscode-microprofile/issues/15).
 * Detect lightweight java language server. See [#14](https://github.com/redhat-developer/vscode-microprofile/pull/14).
 * NPE during completion when Java language server is started in LightWeight mode. See [#12](https://github.com/redhat-developer/vscode-microprofile/issues/12).
 * Allow `[`, `]`, and `#` in property keys TextMate grammar. See [#11](https://github.com/redhat-developer/vscode-microprofile/pull/11).
 * NullPointerException with symbols. See [lsp4mp#66](https://github.com/eclipse/lsp4mp/issues/66).
 * Fix duplicate of `quarkus-properties` when registering `textDocument/rangeFormatting`. See [lsp4mp#52](https://github.com/eclipse/lsp4mp/pull/52).
 * Rename settings prefix to microprofile. See [lsp4mp#51](https://github.com/eclipse/lsp4mp/pull/51).
 * Fix missing unit in Gauge metrics snippet. See [lsp4mp#47](https://github.com/eclipse/lsp4mp/pull/47).
 * Escape special characters within LSP snippets. See [lsp4mp#29](https://github.com/eclipse/lsp4mp/pull/29).
 * Completion in properties file gives enum values before `=`. See [lsp4mp#14](https://github.com/eclipse/lsp4mp/issues/14).

### Build

 * Setup CI. See [#4](https://github.com/redhat-developer/vscode-microprofile/issues/4).

### Other

 * Add gitter link to readme. See [#20](https://github.com/redhat-developer/vscode-microprofile/pull/20).
 * Fix missing space in switch java mode prompt. See [#17](https://github.com/redhat-developer/vscode-microprofile/pull/17).
 * Document external lsp4mp extensions. See [#13](https://github.com/redhat-developer/vscode-microprofile/pull/13).
 * Update contributing guide. See [#10](https://github.com/redhat-developer/vscode-microprofile/pull/10).
 * Test collecting lsp4mp extensions. See [#7](https://github.com/redhat-developer/vscode-microprofile/pull/7).
 * Add badges. See [#6](https://github.com/redhat-developer/vscode-microprofile/pull/6).
 * Apache 2.0 License. See [#5](https://github.com/redhat-developer/vscode-microprofile/pull/5).
 * Remove quarkus-properties language. See [#3](https://github.com/redhat-developer/vscode-microprofile/issues/3).
 * Update contributing guide. See [#2](https://github.com/redhat-developer/vscode-microprofile/issues/2).
