/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, FC } from 'react';
import {
  EuiComboBox,
  EuiComboBoxOptionProps,
  EuiDescribedFormGroup,
  EuiFormRow,
} from '@elastic/eui';

import { Field, SplitField } from '../../../../../../../../common/types/fields';

interface Props {
  fields: Field[];
  changeHandler(i: string[]): void;
  selectedInfluencers: string[];
  splitField: SplitField;
}

export const InfluencersSelect: FC<Props> = ({
  fields,
  changeHandler,
  selectedInfluencers,
  splitField,
}) => {
  const options: EuiComboBoxOptionProps[] = fields.map(f => ({
    label: f.name,
  }));
  const selection: EuiComboBoxOptionProps[] = selectedInfluencers.map(i => ({ label: i }));

  function onChange(selectedOptions: EuiComboBoxOptionProps[]) {
    changeHandler(selectedOptions.map(o => o.label));
  }

  return (
    <EuiDescribedFormGroup
      idAria="single-example-aria"
      title={<h3>Influencers</h3>}
      description={
        <Fragment>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </Fragment>
      }
    >
      <EuiFormRow label="Influencers" describedByIds={['single-example-aria']}>
        <EuiComboBox
          options={options}
          selectedOptions={selection}
          onChange={onChange}
          isClearable={false}
        />
      </EuiFormRow>
    </EuiDescribedFormGroup>
  );
};
