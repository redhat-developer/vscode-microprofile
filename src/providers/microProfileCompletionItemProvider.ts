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

import { CancellationToken, commands, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument } from "vscode";
import { JAVA_COMPLETION_REQUEST } from "../definitions/microProfileLSRequestNames";

/**
 * Provides context-aware completion suggestions for Java files in MicroProfile projects
 */
export class MicroProfileCompletionItemProvider implements CompletionItemProvider<CompletionItem> {

  provideCompletionItems(
      document: TextDocument,
      position: Position,
      _token: CancellationToken,
      _context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    return commands.executeCommand("java.execute.workspaceCommand", JAVA_COMPLETION_REQUEST, adaptToMicroProfileCompletionParams(document, position));
  }

}

function adaptToMicroProfileCompletionParams(document: TextDocument, position: Position): MicroProfileCompletionParams {
  return {
    uri: document.uri.toString(),
    position: position
  }
}

interface MicroProfileCompletionParams {
  uri: string;
  position: Position;
}
