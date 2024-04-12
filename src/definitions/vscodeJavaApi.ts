/**
 * Copyright 2024 Red Hat, Inc. and others.

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
import type { Event } from "vscode";

/**
 * @see https://github.com/redhat-developer/vscode-java/blob/master/src/extension.api.ts#L116
 */
export type JavaExtensionAPI = {
  serverMode: ServerMode;
  readonly javaRequirement: RequirementsData;
  readonly onDidServerModeChange: Event<ServerMode>;
  readonly serverReady: () => Promise<boolean>;
};

export enum ServerMode {
  STANDARD = "Standard",
  LIGHTWEIGHT = "LightWeight",
  HYBRID = "Hybrid",
}

/* eslint-disable @typescript-eslint/naming-convention */
export interface RequirementsData {
  tooling_jre: string;
  tooling_jre_version: number;
  java_home: string;
  java_version: number;
}
