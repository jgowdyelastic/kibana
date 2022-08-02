/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ChangePoint } from '@kbn/ml-agg-utils';

import { API_ACTION_NAME, AiopsExplainLogRateSpikesApiAction } from './explain_log_rate_spikes';

interface StreamState {
  ccsWarning: boolean;
  changePoints: ChangePoint[];
  loaded: number;
  loadingState: string;
}

export const initialState: StreamState = {
  ccsWarning: false,
  changePoints: [],
  loaded: 0,
  loadingState: '',
};

export function streamReducer(
  state: StreamState,
  action: AiopsExplainLogRateSpikesApiAction | AiopsExplainLogRateSpikesApiAction[]
): StreamState {
  if (Array.isArray(action)) {
    return action.reduce(streamReducer, state);
  }

  switch (action.type) {
    case API_ACTION_NAME.ADD_CHANGE_POINTS:
      return { ...state, changePoints: [...state.changePoints, ...action.payload] };
    case API_ACTION_NAME.ADD_CHANGE_POINTS_HISTOGRAM:
      const changePoints = state.changePoints.map((cp) => {
        const cpHistogram = action.payload.find(
          (h) => h.fieldName === cp.fieldName && h.fieldValue === cp.fieldValue
        );
        if (cpHistogram) {
          cp.histogram = cpHistogram.histogram;
        }
        return cp;
      });
      return { ...state, changePoints };
    case API_ACTION_NAME.RESET:
      return initialState;
    case API_ACTION_NAME.UPDATE_LOADING_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
