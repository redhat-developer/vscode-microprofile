/**
 * Copyright 2021 Red Hat, Inc. and others.

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

import { DocumentSelector, languages } from "vscode";
import { DocumentFilter, LanguageClient } from "vscode-languageclient/node";
import { MicroProfileCompletionItemProvider } from "./microProfileCompletionItemProvider";
import { MicroprofileInlayHintsProvider } from "./microprofileInlayHintsProvider";

/**
 * Register language feature providers that are not provided directly by lsp4mp
 */
export function registerProviders(languageClient: LanguageClient, documentSelector: DocumentSelector): void {
  const javaDocumentFilter = (<DocumentFilter[]>documentSelector)[0];
  languages.registerCompletionItemProvider(javaDocumentFilter, new MicroProfileCompletionItemProvider(), //
    "\"");
  const supportRegisterInlayHintsProvider = (languages as any).registerInlayHintsProvider;
  if (supportRegisterInlayHintsProvider) {
    const mpDocumentFilter = (<DocumentFilter[]>documentSelector).slice(1);
    (languages.registerInlayHintsProvider(mpDocumentFilter, new MicroprofileInlayHintsProvider(languageClient)));
  }
}
