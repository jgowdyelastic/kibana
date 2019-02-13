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



// service for interacting with the server

import chrome from 'ui/chrome';

import { addSystemApiHeader } from 'ui/system_api';

export function http(options) {
  return new Promise((resolve, reject) => {
    if(options && options.url) {
      let url = '';
      url = url + (options.url || '');
      const headers = addSystemApiHeader({
        'Content-Type': 'application/json',
        'kbn-version': chrome.getXsrfToken(),
        ...options.headers
      });

      const allHeaders = (options.headers === undefined) ? headers : { ...options.headers, ...headers };
      const body = (options.data === undefined) ? null : JSON.stringify(options.data);

      const payload = {
        method: (options.method || 'GET'),
        headers: allHeaders,
        credentials: 'same-origin'
      };

      if (body !== null) {
        payload.body = body;
      }

      fetch(url, payload)
        .then((resp) => {
          resp.json().then((resp.ok === true) ? resolve : reject);
        })
        .catch((resp) => {
          reject(resp);
        });
    } else {
      reject();
    }
  });
}
