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

import { callWithRequestFactory } from '../client/call_with_request_factory';
import { wrapError } from '../client/errors';

const LANGS = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
};

function getLangTitle(lang) {
  const l = LANGS[lang];
  return l || '';
}

function getLang(resp) {
  if (resp.docs && resp.docs.length) {
    const { _index: index, _source } = resp.docs[0].doc;
    const { text, lang } = _source;
    return {
      index,
      text,
      lang,
      langTitle: getLangTitle(lang),
    };
  } else {
    return {};
  }
}

export function routes(server, commonRouteConfig) {

  server.route({
    method: 'POST',
    path: '/api/li/identify',
    handler(request) {
      const callWithRequest = callWithRequestFactory(server, request);
      const text = request.payload.text;
      const body = {
        docs: [
          {
            _index: 'lang',
            _source: {
              text
            }
          }
        ]
      };

      return callWithRequest('li.identify', { body })
        .then(getLang)
        .catch(resp => wrapError(resp));
    },
    config: {
      ...commonRouteConfig
    }
  });
}

