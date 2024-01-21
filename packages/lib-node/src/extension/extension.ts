/**
 *  Copyright 2023 OwlMeans, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Extension } from "@owlmeans/vc-core"
import { ProduceRouter, ServerExtension } from "./types"

export const buildServerExtension = (extension: Extension, produceRouter: ProduceRouter): ServerExtension => {
  const _extension: Partial<ServerExtension> = extension

  _extension.produceRouter = produceRouter

  _extension.extension = extension

  return _extension as ServerExtension
}
