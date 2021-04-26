/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import './_index.scss';
import React, { FC } from 'react';
import { KibanaContextProvider } from '../../../../../src/plugins/kibana_react/public';
import { getCoreStart, getPluginsStart, getPluginsSetup } from '../kibana_services';

// @ts-ignore
import { FileDataVisualizerView } from './components/file_datavisualizer_view/index';

export const FileDataVisualizer: FC = () => {
  const coreStart = getCoreStart();
  const { data, maps, embeddable, share, fileUpload } = getPluginsStart();
  const { security } = getPluginsSetup();
  const services = { data, maps, embeddable, share, security, fileUpload, ...coreStart };

  return (
    <KibanaContextProvider services={{ ...services }}>
      <FileDataVisualizerView
        indexPatterns={data.indexPatterns}
        savedObjectsClient={coreStart.savedObjects.client}
        http={coreStart.http}
        fileUpload={fileUpload}
      />
    </KibanaContextProvider>
  );
};
