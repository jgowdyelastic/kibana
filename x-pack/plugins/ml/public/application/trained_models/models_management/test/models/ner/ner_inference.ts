/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as estypes from '@elastic/elasticsearch/lib/api/typesWithBodyKey';

import { trainedModelsApiProvider } from '../../../../../services/ml_api_service/trained_models';

const DEFAULT_INPUT_FIELD = 'text_field';

export type FormattedNerResp = Array<{
  value: string;
  entity: estypes.MlTrainedModelEntities | null;
}>;

export class NerInference {
  private trainedModelsApi: ReturnType<typeof trainedModelsApiProvider>;
  private model: estypes.MlTrainedModelConfig;
  private inputField: string;

  constructor(
    trainedModelsApi: ReturnType<typeof trainedModelsApiProvider>,
    model: estypes.MlTrainedModelConfig
  ) {
    this.trainedModelsApi = trainedModelsApi;
    this.model = model;
    this.inputField = model.input?.field_names[0] ?? DEFAULT_INPUT_FIELD;
  }

  public async infer(inputText: string): Promise<{
    response: FormattedNerResp;
    rawResponse: estypes.MlInferTrainedModelDeploymentResponse;
  }> {
    const payload = { docs: { [this.inputField]: inputText } };
    const resp = await this.trainedModelsApi.inferTrainedModel(this.model.model_id, payload);

    return { response: parseResponse(resp), rawResponse: resp };
  }
}

function parseResponse(resp: estypes.MlInferTrainedModelDeploymentResponse): FormattedNerResp {
  const { predicted_value: predictedValue, entities } = resp;
  const splitWordsAndEntitiesRegex = /(\[.*?\]\(.*?&.*?\))/;
  const matchEntityRegex = /(\[.*?\])\((.*?)&(.*?)\)/;
  if (predictedValue === undefined || entities === undefined) {
    return [];
  }

  const sentenceChunks = (predictedValue as unknown as string).split(splitWordsAndEntitiesRegex);
  let count = 0;
  return sentenceChunks.map((chunk) => {
    const matchedEntity = chunk.match(matchEntityRegex);
    if (matchedEntity) {
      const entityValue = matchedEntity[3];
      const entity = entities[count];
      if (entityValue !== entity.entity) {
        // eslint-disable-next-line no-console
        console.error('mismatch entity', entity);
      }
      count++;
      return { value: entityValue, entity };
    }
    return { value: chunk, entity: null };
  });
}
