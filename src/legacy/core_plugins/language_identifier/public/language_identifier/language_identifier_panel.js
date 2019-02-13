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


import React, { Component, Fragment } from 'react';

import {
  EuiCallOut,
  EuiSpacer,
} from '@elastic/eui';

import { languageIdentifierService } from './language_identifier_service';

export class LanguageIdentifierPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      text: '',
      lang: '',
      index: '',
      langTitle: ','
    };
  }

  componentDidMount() {
    languageIdentifierService.setUpdatePanelFunction(this.setDetails);
  }

  setDetails = (show, { text, lang, index, langTitle }) => {
    this.setState({ show, text, lang, index, langTitle });
  }

  render() {
    const {
      show,
      index,
      langTitle,
    } = this.state;

    if (show === false) {
      return null;
    }

    return (
      <Fragment>
        <EuiCallOut
          title={`${langTitle} text identified`}
          iconType="globe"
        >
          <p>
            Index has been changed to {index}
          </p>
        </EuiCallOut>
        <EuiSpacer size="m" />
      </Fragment>
    );
  }
}
