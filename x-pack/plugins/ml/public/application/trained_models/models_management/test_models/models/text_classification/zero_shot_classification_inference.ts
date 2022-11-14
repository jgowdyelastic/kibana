/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { BehaviorSubject } from 'rxjs';
import { InferenceBase } from '../inference_base';
import { processInferenceResult, processResponse } from './common';
import type { TextClassificationResponse, RawTextClassificationResponse } from './common';

import { getZeroShotClassificationInput } from './zero_shot_classification_input';
import { getTextClassificationOutputComponent } from './text_classification_output';
import { SUPPORTED_PYTORCH_TASKS } from '../../../../../../../common/constants/trained_models';

export class ZeroShotClassificationInference extends InferenceBase<TextClassificationResponse> {
  protected inferenceType = SUPPORTED_PYTORCH_TASKS.ZERO_SHOT_CLASSIFICATION;
  protected inferenceTypeLabel = i18n.translate(
    'xpack.ml.trainedModels.testModelsFlyout.zeroShotClassification.label',
    { defaultMessage: 'Zero shot classification' }
  );
  protected info = [
    i18n.translate('xpack.ml.trainedModels.testModelsFlyout.zeroShotClassification.info1', {
      defaultMessage:
        'Provide a set of labels and test how well the model classifies your input text.',
    }),
  ];

  public labelsText$ = new BehaviorSubject<string>('');

  public async inferText() {
    try {
      return await this.runInfer<RawTextClassificationResponse>(
        (inputText: string) => {
          const labelsText = this.labelsText$.getValue();
          const inputLabels = labelsText?.split(',').map((l) => l.trim());
          return {
            docs: [{ [this.inputField]: inputText }],
            ...this.getInferenceConfig([{ labels: inputLabels }, { multi_label: false }]),
          };
        },
        (resp, inputText) => {
          return processResponse(resp, this.model, inputText);
        }
      );
    } catch (error) {
      this.setFinishedWithErrors(error);
      throw error;
    }
  }

  protected async inferIndex() {
    try {
      return await this.runPipelineSimulate((doc) => {
        return {
          response: processInferenceResult(doc._source[this.inferenceType], this.model),
          rawResponse: doc._source[this.inferenceType],
          inputText: doc._source[this.inputField],
        };
      });
    } catch (error) {
      this.setFinishedWithErrors(error);
      throw error;
    }
  }

  private getInputLabels() {
    const labelsText = this.labelsText$.getValue();
    return labelsText?.split(',').map((l) => l.trim());
  }

  protected getProcessors() {
    const inputLabels = this.getInputLabels();
    return this.getBasicProcessors([{ labels: inputLabels }, { multi_label: false }]);
  }

  public getInputComponent(): JSX.Element {
    const placeholder = i18n.translate(
      'xpack.ml.trainedModels.testModelsFlyout.zeroShotClassification.inputText',
      {
        defaultMessage: 'Enter a phrase to test',
      }
    );
    return getZeroShotClassificationInput(this, placeholder);
  }

  public getOutputComponent(): JSX.Element {
    return getTextClassificationOutputComponent(this);
  }
}
