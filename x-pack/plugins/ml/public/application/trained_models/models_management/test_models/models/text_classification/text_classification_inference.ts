/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { InferenceBase, INPUT_TYPE } from '../inference_base';
import { processInferenceResult, processResponse } from './common';
import type { TextClassificationResponse, RawTextClassificationResponse } from './common';
import { getGeneralInputComponent } from '../text_input';
import { getTextClassificationOutputComponent } from './text_classification_output';
import { SUPPORTED_PYTORCH_TASKS } from '../../../../../../../common/constants/trained_models';

export class TextClassificationInference extends InferenceBase<TextClassificationResponse> {
  protected inferenceType = SUPPORTED_PYTORCH_TASKS.TEXT_CLASSIFICATION;
  protected inferenceTypeLabel = i18n.translate(
    'xpack.ml.trainedModels.testModelsFlyout.textClassification.label',
    { defaultMessage: 'Text classification' }
  );
  protected info = [
    i18n.translate('xpack.ml.trainedModels.testModelsFlyout.textClassification.info1', {
      defaultMessage: 'Test how well the model classifies your input text.',
    }),
  ];

  public async inferText() {
    try {
      return await this.runInfer<RawTextClassificationResponse>(
        (inputText: string) => {
          return {
            docs: [{ [this.inputField]: inputText }],
            ...this.getInferenceConfig([this.getNumTopClassesConfig()]),
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

  protected getProcessors() {
    return this.getBasicProcessors([this.getNumTopClassesConfig()]);
  }

  public getInputComponent(): JSX.Element | null {
    if (this.inputType === INPUT_TYPE.TEXT) {
      const placeholder = i18n.translate(
        'xpack.ml.trainedModels.testModelsFlyout.textClassification.inputText',
        {
          defaultMessage: 'Enter a phrase to test',
        }
      );
      return getGeneralInputComponent(this, placeholder);
    } else {
      return null;
    }
  }

  public getOutputComponent(): JSX.Element {
    return getTextClassificationOutputComponent(this);
  }
}
