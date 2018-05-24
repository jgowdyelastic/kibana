/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { aggregationTypeTransform } from '../../../common/util/anomaly_utils';

export function createDetectorsFromVisualizationSearch(search) {
  if (search.aggs === undefined || (typeof search.aggs === 'object' && Object.keys(search.aggs).length === 0)) {
    return { error: 'No root aggregation' };
  }

  const rootAgg = search.aggs[Object.keys(search.aggs)[0]];
  const dateHistogram = rootAgg.date_histogram;
  if (dateHistogram === undefined) {
    return { error: 'No date_histogram' };
  }
  // const timeField = dateHistogram.field;
  // const interval = dateHistogram.interval;

  if (rootAgg.aggs === undefined || (typeof rootAgg.aggs === 'object' && Object.keys(rootAgg.aggs).length === 0)) {
    return { error: 'No aggregations' };
  }

  const detectors = [];
  let aggs = [];
  let split = undefined;
  const subAggs = rootAgg.aggs[Object.keys(rootAgg.aggs)[0]];
  if (subAggs.terms === undefined) {
    aggs = rootAgg.aggs;
  } else {
    split = subAggs.terms.field;
    aggs = subAggs.aggs;
  }

  try {
    detectors.push(...getDetectorsFromAggsList(aggs, split));
  } catch (error) {
    return { error: 'No ML applicable aggregation types' };
  }

  // return {
  //   detectors,
  //   timeField,
  //   interval
  // };
  return { detectors };
}

function getDetectorsFromAggsList(aggs, split) {
  const dtrs = [];
  Object.keys(aggs).forEach((k) => {
    const agg = aggs[k];
    const aggType = Object.keys(agg)[0];
    const dtr =  {
      function: aggregationTypeTransform.toML(aggType),
      field_name: agg[aggType].field
    };
    if (split !== undefined) {
      dtr.partition_field_name = split;
    }
    dtrs.push(dtr);
  });
  return dtrs;
}

export function convertDetectorsToJobSettings(detectors) {
  const splits = {};
  const fields = detectors.map((dtr) => {
    const field = {
      agg: aggregationTypeTransform.toES(dtr.function),
      fieldName: dtr.field_name
    };
    splits[dtr.partition_field_name] = dtr.partition_field_name;

    if (dtr.partition_field_name !== undefined) {
      field.split = dtr.partition_field_name;
    }
    return field;
  });

  const jobSettings = {
    fields
  };

  const splitKeys = Object.keys(splits);
  if(splitKeys.length === 1) {
    fields.forEach(f => delete f.split);
    if (splitKeys[0] !== 'undefined') {
      jobSettings.split = splitKeys[0];
    }
  } else if (splitKeys.length > 1) {
    fields.forEach((f) => {
      if (f.split === undefined) {
        delete f.split;
      }
    });
  }


  return jobSettings;
}

export function createURLJobSettingsFromVisualizationSearch(search) {
  const { detectors, error } = createDetectorsFromVisualizationSearch(search);
  if (error === undefined) {
    return convertDetectorsToJobSettings(detectors);
  } else {
    return error;
  }
}

export async function canCreateJob(search) {
  return {
    canCreate: (await createDetectorsFromVisualizationSearch(search) !== null)
  };
}
