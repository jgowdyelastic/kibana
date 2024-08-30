/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { isRefResult } from '../../../common/runtime_types/ping/synthetics';
import { UMServerLibs } from '../../lib/lib';
import { ScreenshotReturnTypesUnion } from '../../lib/requests/get_journey_screenshot';
import { UMRestApiRouteFactory } from '../types';

function getSharedHeaders(stepName: string, totalSteps: number) {
  return {
    'cache-control': 'max-age=600',
    'caption-name': stepName,
    'max-steps': String(totalSteps),
  };
}

export const createJourneyScreenshotRoute: UMRestApiRouteFactory = (libs: UMServerLibs) => ({
  method: 'GET',
  path: '/api/uptime/journey/screenshot/{checkGroup}/{stepIndex}',
  validate: {
    params: schema.object({
      checkGroup: schema.string(),
      stepIndex: schema.number(),
    }),
  },
  handler: async ({ uptimeEsClient, request, response }) => {
    const { checkGroup, stepIndex } = request.params;

    const result: ScreenshotReturnTypesUnion | null = await libs.requests.getJourneyScreenshot({
      uptimeEsClient,
      checkGroup,
      stepIndex,
    });

    if (isRefResult(result)) {
      return response.ok({
        body: {
          screenshotRef: result,
        },
        headers: getSharedHeaders(result.synthetics.step.name, result.totalSteps),
      });
    }

    return response.notFound();
  },
});
