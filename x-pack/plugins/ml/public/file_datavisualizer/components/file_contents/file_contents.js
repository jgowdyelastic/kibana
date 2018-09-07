/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */


import React from 'react';

import {
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui';

import { MLJobEditor } from '../../../jobs/jobs_list/components/ml_job_editor';

export function FileContents({ data, format, numberOfLines }) {
  let mode = 'text';
  if (format === 'json') {
    mode = 'json';
  }

  const formattedData = limitByNumberOfLines(data, numberOfLines);

  return (
    <React.Fragment>
      <EuiTitle size="s">
        <h3>File contents</h3>
      </EuiTitle>

      <div>First {numberOfLines} lines</div>

      <EuiSpacer size="s" />

      <MLJobEditor
        mode={mode}
        readOnly={true}
        value={formattedData}
        height="200px"
      />
    </React.Fragment>
  );
}

function limitByNumberOfLines(data, numberOfLines) {
  return data.split('\n').slice(0, numberOfLines).join('\n');
}
