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


import chrome from 'ui/chrome';
import { http } from '../services/http_service';
const basePath = chrome.addBasePath('/api/li');

class LanguageIdentifierService {
  constructor() {
    this.updatePanel = () => {};
  }

  setUpdatePanelFunction(func) {
    this.updatePanel = func;
  }

  hidePanel() {
    this.updatePanel(false, {});
  }

  async processFetchParams(allFetchParams) {
    console.log(allFetchParams);
    this.hidePanel();
    if (allFetchParams.length && allFetchParams[0].resolved.query) {
      console.log('Original index', allFetchParams[0].resolved.index);
      const text = allFetchParams[0].resolved.query[0].query;
      if (text) {
        const results = await this.getLanguage(text);
        console.log(results.langTitle);

        let indexChanged = false;
        if (results && results.index && allFetchParams[0].resolved.index !== results.index) {
          allFetchParams[0].resolved.index = results.index;
          indexChanged = true;
          console.log('New index', allFetchParams[0].resolved.index);
        }
        this.updatePanel(true, { ...results, indexChanged });
      }
    }
  }

  async getLanguage(text) {
    const langDetails = await http({
      url: `${basePath}/identify`,
      method: 'POST',
      data: {
        text
      },
    });

    return langDetails;
  }

}

export const languageIdentifierService = new LanguageIdentifierService();
