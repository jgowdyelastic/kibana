/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  AiopsLogRateAnalysisSchema,
  AiopsLogRateAnalysisApiAction,
} from './log_rate_analysis';
import { streamReducer } from './stream_reducer';

export const API_ENDPOINT = {
  EXPLAIN_LOG_RATE_SPIKES: '/internal/aiops/log_rate_analysis',
  CATEGORIZATION_FIELD_EXAMPLES: '/internal/aiops/categorization_field_validation',
} as const;

type AiopsApiEndpointKeys = keyof typeof AIOPS_API_ENDPOINT;
export type AiopsApiEndpoint = typeof AIOPS_API_ENDPOINT[AiopsApiEndpointKeys];

export interface AiopsApiLogRateAnalysis {
  endpoint: AiopsApiEndpoint;
  apiVersion: string;
  reducer: typeof streamReducer;
  body: AiopsLogRateAnalysisSchema;
  actions: AiopsLogRateAnalysisApiAction;
}
