/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ChartsPluginStart } from '@kbn/charts-plugin/public';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { FieldFormatsStart } from '@kbn/field-formats-plugin/public';
import type { IStorageWrapper } from '@kbn/kibana-utils-plugin/public';
import type { LensPublicStart } from '@kbn/lens-plugin/public';
import type { SharePluginStart } from '@kbn/share-plugin/public';
import type { UiActionsSetup, UiActionsStart } from '@kbn/ui-actions-plugin/public';
import type { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';

export interface AiopsPluginSetupDeps {
  uiActions: UiActionsSetup;
}

export interface AiopsPluginStartDeps {
  data: DataPublicPluginStart;
  charts: ChartsPluginStart;
  uiActions: UiActionsStart;
  fieldFormats: FieldFormatsStart;
  lens: LensPublicStart;
  share: SharePluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
  storage: IStorageWrapper;
}

/**
 * aiops plugin server setup contract
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AiopsPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AiopsPluginStart {}
