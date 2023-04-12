# Tools for MicroProfile Changelog

## [0.7.1](https://github.com/redhat-developer/vscode-microprofile/milestone/9?closed=1) (April 12, 2023)

### Bug Fixes
 * Fix context-aware snippets in projects that use Project Lombok. See [#155](https://github.com/redhat-developer/vscode-microprofile/issues/155).

## [0.7.0](https://github.com/redhat-developer/vscode-microprofile/milestone/7?closed=1) (April 4, 2023)

### Enhancements
 * Validation for GraphQL `@Query` and `@Mutation` methods with `void` return type. See [eclipse/lsp4mp#348](https://github.com/eclipse/lsp4mp/issues/348), [eclipse/lsp4mp#359](https://github.com/eclipse/lsp4mp/issues/359).
 * Navigate to REST endpoints using workspace symbols. See [eclipse/lsp4mp#87](https://github.com/eclipse/lsp4mp/issues/87).
 * Validate lists in `@ConfigProperty`'s `defaultValue`. See [#143](https://github.com/redhat-developer/vscode-microprofile/issues/143).
 * Show config property documentation when hovering over the key in a properties file. See [#135](https://github.com/redhat-developer/vscode-microprofile/pull/135).
 * Make Java file snippets context-aware. See [eclipse/lsp4mp#108](https://github.com/eclipse/lsp4mp/issues/108).
 * Upgrade to vscode-languageclient 8.y.z. See [#146](https://github.com/redhat-developer/vscode-microprofile/issues/146).
 * Migrate from `find-java-home` to `jdk-utils`. See [#140](https://github.com/redhat-developer/vscode-microprofile/issues/140).

### Bug Fixes
 * Hover fails in properties files when the Java language server is loading. See [eclipse/lsp4mp#375](https://github.com/eclipse/lsp4mp/issues/375).
 * Definition sometimes fails on property values in a properties file. See [eclipse/lsp4mp#374](https://github.com/eclipse/lsp4mp/issues/374).
 * Adjust go to definition range for property keys to include the offset between the property key and `=`. See [redhat-developer/quarkus-ls#323](https://github.com/redhat-developer/quarkus-ls/issues/323).
 * Fix `NullPointerException` during go to definition in properties files. See [eclipse/lsp4mp#372](https://github.com/eclipse/lsp4mp/issues/372).
 * Fix `NullPointerException` on shutdown when LSP client doesn't define extendedClientCapabilities. See [eclipse/lsp4mp#363](https://github.com/eclipse/lsp4mp/pull/363).
 * Completion causes Exceptions when typing in a Java file. See [eclipse/lsp4mp#347](https://github.com/eclipse/lsp4mp/issues/347).
 * Support the `jakarta` namespace (JakartaEE 9+). See [eclipse/lsp4mp#344](https://github.com/eclipse/lsp4mp/issues/344).
 * Hovering over properties file fails with `NullPointerException` when there are multiple definitions of a property. See [eclipse/lsp4mp#341](https://github.com/eclipse/lsp4mp/issues/341).
 * `config_ordinal` appears as a property even in non-MicroProfile projects. See [eclipse/lsp4mp#312](https://github.com/eclipse/lsp4mp/issues/312).
 * Quick fix to assign a value to a property now handles the prefix set by `@ConfigProperties` properly. See [eclipse/lsp4mp#303](https://github.com/eclipse/lsp4mp/issues/303).
 * Change wording of "Unknown property" error message to "Unrecognized property". See [eclipse/lsp4mp#290](https://github.com/eclipse/lsp4mp/issues/290).

### Build
 * Use `vsce` from namespace `@vscode`. See [#141](https://github.com/redhat-developer/vscode-microprofile/pull/141).

## [0.6.0](https://github.com/redhat-developer/vscode-microprofile/milestone/6?closed=1) (December 1, 2022)

### Enhancements
 * Display property value as inlay hint. See [#108](https://github.com/redhat-developer/vscode-microprofile/pull/108).
 * Property evaluation should support the environment variable default value notation. See [eclipse/lsp4mp#241](https://github.com/eclipse/lsp4mp/issues/241).
 * Manage static properties using a `staticProvider` extension point. See [eclipse/lsp4mp#44](https://github.com/eclipse/lsp4mp/issues/44).
 * Improve code action performance with `CodeAction#data` & `resolveCodeAction`. See [#124](https://github.com/redhat-developer/vscode-microprofile/pull/124), [eclipse/lsp4mp#171](https://github.com/eclipse/lsp4mp/issues/171).
 * Diagnostics for mp-reactive-messaging `@Incoming`/`@Outgoing` annotation. See [eclipse/lsp4mp#58](https://github.com/eclipse/lsp4mp/issues/58).
 * Only activate extension if Java project is present. See [#114](https://github.com/redhat-developer/vscode-microprofile/issues/114).

### Bug Fixes
 * Don't throw an error popup when MicroProfile LS cancels the inlay hint process. See [#123](https://github.com/redhat-developer/vscode-microprofile/pull/123).
 * Java source code not validated upon start. See [eclipse/lsp4mp#301](https://github.com/eclipse/lsp4mp/issues/301).
 * `ClassCastException` thrown (and caught) when using invalid `@ConfigProperty` default value. See [eclipse/lsp4mp#295](https://github.com/eclipse/lsp4mp/issues/295).
 * Improve handling of `@ConfigProperties` for validation. See [eclipse/lsp4mp#304](https://github.com/eclipse/lsp4mp/issues/304).
 * Support for the `config_ordinal` property in `microprofile-config.properties`. See [eclipse/lsp4mp#289](https://github.com/eclipse/lsp4mp/issues/289).
 * Display property value when hovering over a key that isn't defined in the application. See [eclipse/lsp4mp#285](https://github.com/eclipse/lsp4mp/issues/285).
 * REST client code lens only shows up for `GET` annotations. See [eclipse/lsp4mp#94](https://github.com/eclipse/lsp4mp/issues/94).
 * JAXRS code lens URL should always appear above method declaration. See [eclipse/lsp4mp#194](https://github.com/eclipse/lsp4mp/issues/194).
 * Support `microprofile-health` 3.0 and later. See [eclipse/lsp4mp#314](https://github.com/eclipse/lsp4mp/issues/314).
 * Make `microprofile.tools.server.vmargs` setting application scoped. See [#121](https://github.com/redhat-developer/vscode-microprofile/pull/121).
 * Disable JVM logging to avoid language server failure. See [#118](https://github.com/redhat-developer/vscode-microprofile/issues/118).
 * Fix inlay hints & definitions when project returns empty properties. See [eclipse/lsp4mp#311](https://github.com/eclipse/lsp4mp/pull/311).
 * Fix code lens when no configuration sources available. See [eclipse/lsp4mp#315](https://github.com/eclipse/lsp4mp/issues/315).
 * `@ConfigProperties` validation should check the annotation's fully qualified name. See [eclipse/lsp4mp#304](https://github.com/eclipse/lsp4mp/issues/304).
 * Fix typo in `mpirc` snippet. See [eclipse/lsp4mp#325](https://github.com/eclipse/lsp4mp/issues/325).

### Build
 * Add support for pre-releases. See [#113](https://github.com/redhat-developer/vscode-microprofile/pull/113).
 * Update node in CI and CD to 14. See [#106](https://github.com/redhat-developer/vscode-microprofile/pull/106).
 * Update Jenkinsfile to use Java 17. See [#111](https://github.com/redhat-developer/vscode-microprofile/pull/111).
 * Update vscode-redhat-telemetry to 0.5.2. See [#131](https://github.com/redhat-developer/vscode-microprofile/pull/131).
 * Update Target Platform to 1.16.0-SNAPSHOT version of JDT-LS target. See [eclipse/lsp4mp#288](https://github.com/eclipse/lsp4mp/pull/288).
 * JDT.LS dependency on tests should be optional. See [eclipse/lsp4mp#286](https://github.com/eclipse/lsp4mp/issues/286).
 * Copy over `ModelTextDocuments#computeModelAsyncCompose` from quarkus-ls into commons package. See [eclipse/lsp4mp#257](https://github.com/eclipse/lsp4mp/issues/257).
 * Move VS Code workspace configuration into correct folder. See [eclipse/lsp4mp#145](https://github.com/eclipse/lsp4mp/pull/145).

## [0.5.0](https://github.com/redhat-developer/vscode-microprofile/milestone/5?closed=1) (July 25, 2022)

### Enhancements

 * Colorize profile part in properties. See [#96](https://github.com/redhat-developer/vscode-microprofile/issues/96).
 * Added textmate grammar support for property expressions. See [#95](https://github.com/redhat-developer/vscode-microprofile/pull/95).
 * Delay revalidation and handle validation cancellation correctly. See [eclipse/lsp4mp#252](https://github.com/eclipse/lsp4mp/pull/252).
 * Property file with property expressions (without default value) are flagged as wrong. See [eclipse/lsp4mp#225](https://github.com/eclipse/lsp4mp/issues/225), [eclipse/lsp4mp#227](https://github.com/eclipse/lsp4mp/issues/227).
 * Improved MicroProfile property value expression diagnostic message. See [eclipse/lsp4mp#242](https://github.com/eclipse/lsp4mp/pull/242).

### Bug Fixes

 * Language Server attempts to calculate code actions for stale diagnostics. See [eclipse/lsp4mp#272](https://github.com/eclipse/lsp4mp/issues/272).
 * Hovering property value fails with NPE. See [eclipse/lsp4mp#265](https://github.com/eclipse/lsp4mp/issues/265).
 * Completing property name with existing value will replace current value with default value. See [eclipse/lsp4mp#264](https://github.com/eclipse/lsp4mp/issues/264).
 * Empty completion when completion is triggered before the assign `=`. See [eclipse/lsp4mp#255](https://github.com/eclipse/lsp4mp/issues/255).
 * Improve validation by handling some known corner cases. [eclipse/lsp4mp#249](https://github.com/eclipse/lsp4mp/issues/249), [eclipse/lsp4mp#235](https://github.com/eclipse/lsp4mp/issues/235), [eclipse/lsp4mp#233](https://github.com/eclipse/lsp4mp/issues/233), [eclipse/lsp4mp#232](https://github.com/eclipse/lsp4mp/issues/232), [eclipse/lsp4mp#228](https://github.com/eclipse/lsp4mp/issues/228).

### Build

 * Bump terser from 5.6.1 to 5.14.2. See [#102](https://github.com/redhat-developer/vscode-microprofile/pull/102).
 * Remove ejs dependency. See [#97](https://github.com/redhat-developer/vscode-microprofile/pull/97).

### Documentation

 * Add DCO information to `CONTRIBUTING.md`. See [#99](https://github.com/redhat-developer/vscode-microprofile/issues/99).


## [0.4.0](https://github.com/redhat-developer/vscode-microprofile/milestone/4?closed=1) (March 24, 2022)

### Enhancements

 * Support validation and code actions for `@ConfigProperty`. See [eclipse/lsp4mp#90](https://github.com/eclipse/lsp4mp/issues/90), [eclipse/lsp4mp#176](https://github.com/eclipse/lsp4mp/issues/176) and [eclipse/lsp4mp#147](https://github.com/eclipse/lsp4mp/issues/147).
 * Completion for properties defined using `@ConfigProperties`. See [eclipse/lsp4mp#80](https://github.com/eclipse/lsp4mp/issues/80).
 * Support validation for `@Retry` annotation and its member values. See [eclipse/lsp4mp#191](https://github.com/eclipse/lsp4mp/pull/191) and [eclipse/lsp4mp#196](https://github.com/eclipse/lsp4mp/issues/196).
 * Diagnostics for `@Asynchronous`, `@Bulkhead` & `@Timeout` annotations. See [eclipse/lsp4mp#74](https://github.com/eclipse/lsp4mp/issues/74), [eclipse/lsp4mp#184](https://github.com/eclipse/lsp4mp/pull/184), [eclipse/lsp4mp#185](https://github.com/eclipse/lsp4mp/pull/185).
 * Support the `@ApplicationPath` annotation to handle the project URL. See [eclipse/lsp4mp#179](https://github.com/eclipse/lsp4mp/issues/179).
 * Diagnostics for invalid annotation parameter values. See [eclipse/lsp4mp#77](https://github.com/eclipse/lsp4mp/issues/77).
 * Reference only property declared in properties file in property expression. See [eclipse/lsp4mp#205](https://github.com/eclipse/lsp4mp/issues/205).
 * Support for default value inside properties expression. See [eclipse/lsp4mp#201](https://github.com/eclipse/lsp4mp/issues/201).
 * Use redhat.java embedded JRE to launch the MicroProfile language server. See [#84](https://github.com/redhat-developer/vscode-microprofile/issues/84).
 * Add settings and code action to ignore unassigned property warnings. See [#65](https://github.com/redhat-developer/vscode-microprofile/pull/65) and [eclipse/lsp4mp#187](https://github.com/eclipse/lsp4mp/pull/187).
 * Binary dynamic properties should be generated after an update. See [eclipse/lsp4mp#159](https://github.com/eclipse/lsp4mp/pull/159).
 * Support for config profiles. See [#73](https://github.com/redhat-developer/vscode-microprofile/pull/73).

### Bug Fixes

 * Provide API to configure root path of JAX RS resources. See [eclipse/lsp4mp#174](https://github.com/eclipse/lsp4mp/pull/174).
 * Fix bug with missing definition hover for multiple annotation members. See [eclipse/lsp4mp#216](https://github.com/eclipse/lsp4mp/pull/216).
 * Support optional property reference hover for annotation members. See [eclipse/lsp4mp#211](https://github.com/eclipse/lsp4mp/pull/211).
 * Do not rebuild list of configuration properties when MicroProfile config sources are updated in the build directory. See [eclipse/lsp4mp#162](https://github.com/eclipse/lsp4mp/issues/162).
 * Deadlock when client is sending burst of request. See [eclipse/lsp4mp#177](https://github.com/eclipse/lsp4mp/issues/177).
 * Exclude the method that's being annotated when showing completion for fallback method. See [eclipse/lsp4mp#148](https://github.com/eclipse/lsp4mp/issues/148).
 * SingleMemberAnnotation diagnostics not supported by annotationValidator. See [eclipse/lsp4mp#188](https://github.com/eclipse/lsp4mp/issues/188).
 * Add 'shouldLanguageServerExitOnShutdown' to ExtendedClientCapabilities. See [eclipse/lsp4mp#172](https://github.com/eclipse/lsp4mp/pull/172).
 * Update find-java-home to correctly detect java binary where it is symbolically linked. See [#81](https://github.com/redhat-developer/vscode-microprofile/issues/81).

### Build

 * Use ovsx<0.3.0 to ensure we build with Node v12. See [#87](https://github.com/redhat-developer/vscode-microprofile/pull/87).

### Other

 * Add features documentation for properties/java files. See [#64](https://github.com/redhat-developer/vscode-microprofile/issues/64).
 * Move to vscode-languageclient 7.0.0. See [#68](https://github.com/redhat-developer/vscode-microprofile/pull/68).
 * Add support for `shouldServerExitOnShutdown` capability. See [#69](https://github.com/redhat-developer/vscode-microprofile/issues/69).
 * Update vscode-redhat-telemetry to 0.4.2. See [#74](https://github.com/redhat-developer/vscode-microprofile/pull/74).
 * Update follow-redirects and mocha. See [#86](https://github.com/redhat-developer/vscode-microprofile/pull/86).

## [0.3.0](https://github.com/redhat-developer/vscode-microprofile/milestone/3?closed=1) (July 22, 2021)

### Enhancements

 * Completion for `fallbackMethod` in `@Fallback` annotation. See [eclipse/lsp4mp#34](https://github.com/eclipse/lsp4mp/issues/34).
 * Remove dependency on vscode-commons. See [#55](https://github.com/redhat-developer/vscode-microprofile/issues/55).

### Build

 * Migrate to eslint from tslint. See [#53](https://github.com/redhat-developer/vscode-microprofile/issues/53).
 * Use registry.npmjs.com in `package-lock.json`. See [#50](https://github.com/redhat-developer/vscode-microprofile/pull/50).
 * Migrate to GitHub Actions from travis-ci.org. See [#59](https://github.com/redhat-developer/vscode-microprofile/issues/59).

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
