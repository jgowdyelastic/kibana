/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


export const elasticsearchJsPlugin = (Client, config, components) => {
  const ca = components.clientAction.factory;

  Client.prototype.li = components.clientAction.namespaceFactory();
  const li = Client.prototype.li.prototype;

  /**
   * Perform a [ml.authenticate](Retrieve details about the currently authenticated user) request
   *
   * @param {Object} params - An object with parameters used to carry out this action
   */
  li.identify = ca({
    urls: [
      {
        fmt: '/_ingest/pipeline/lang_ident/_simulate'
      }
    ],
    needBody: true,
    method: 'POST'
  });

};
