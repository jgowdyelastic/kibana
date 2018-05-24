/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */



import { callWithRequestFactory } from '../client/call_with_request_factory';
import { wrapError } from '../client/errors';
import { createURLJobSettingsFromVisualizationSearch } from '../models/auto_generate_job';


function createJobFromVisualizationSearch(callWithRequest, payload) {
  const detectors = createURLJobSettingsFromVisualizationSearch(payload);
  return Promise.resolve((detectors === null) ? { success: false } : { success: true, detectors });
}

export function autoJobCreationRoutes(server, commonRouteConfig) {

  server.route({
    method: 'POST',
    path: '/api/ml/auto_job_creation/create_detectors_from_visualization_search',
    handler(request, reply) {
      const callWithRequest = callWithRequestFactory(server, request);
      return createJobFromVisualizationSearch(callWithRequest, request.payload)
        .then(resp => reply(resp))
        .catch(resp => reply(wrapError(resp)));
    },
    config: {
      ...commonRouteConfig
    }
  });

}
