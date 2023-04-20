/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import type { SavedSearch } from '@kbn/discover-plugin/public';
import type { DataView, DataViewField } from '@kbn/data-views-plugin/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import {
  EuiTitle,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
} from '@elastic/eui';

import { useUrlState } from '@kbn/ml-url-state';
import { buildEmptyFilter, Filter } from '@kbn/es-query';

import { useData } from '../../hooks/use_data';
import { restorableDefaults } from '../explain_log_rate_spikes/explain_log_rate_spikes_app_state';
import { useCategorizeRequest } from './use_categorize_request';
import type { EventRate, Category, SparkLinesPerCategory } from './use_categorize_request';
import { CategoryTable } from './category_table';
import { useAiopsAppContext } from '../../hooks/use_aiops_app_context';
import { InformationText } from './information_text';
import { createMergedEsQuery } from '../../application/utils/search_utils';
import { SamplingMenu } from './sampling_menu';
import { TechnicalPreviewBadge } from './technical_preview_badge';
import { LoadingCategorization } from './loading_categorization';

export interface LogCategorizationPageProps {
  dataView: DataView;
  savedSearch: SavedSearch | null;
  selectedField: DataViewField;
  onClose: () => void;
}

const BAR_TARGET = 20;

export const LogCategorizationFlyout: FC<LogCategorizationPageProps> = ({
  dataView,
  savedSearch,
  selectedField,
  onClose,
}) => {
  const {
    notifications: { toasts },
    data: {
      query: { getState, filterManager },
    },
    uiSettings,
  } = useAiopsAppContext();
  const { euiTheme } = useEuiTheme();

  const mounted = useRef(false);
  const { runCategorizeRequest, cancelRequest, randomSampler } = useCategorizeRequest();
  const [aiopsListState, setAiopsListState] = useState(restorableDefaults);
  const [globalState, setGlobalState] = useUrlState('_g');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSavedSearch /* , setSelectedSavedSearch*/] = useState(savedSearch);
  const [loading, setLoading] = useState(true);
  const [eventRate, setEventRate] = useState<EventRate>([]);
  const [pinnedCategory, setPinnedCategory] = useState<Category | null>(null);
  const [data, setData] = useState<{
    categories: Category[];
    sparkLines: SparkLinesPerCategory;
  } | null>(null);

  useEffect(
    function cancelRequestOnLeave() {
      mounted.current = true;
      return () => {
        mounted.current = false;
        cancelRequest();
      };
    },
    [cancelRequest, mounted]
  );

  const {
    documentStats,
    timefilter,
    earliest,
    latest,
    searchQueryLanguage,
    searchString,
    searchQuery,
    intervalMs,
    forceRefresh,
  } = useData(
    { selectedDataView: dataView, selectedSavedSearch },
    aiopsListState,
    setGlobalState,
    'log_categorization',
    undefined,
    undefined,
    BAR_TARGET,
    true
  );

  useEffect(() => {
    if (globalState?.time !== undefined) {
      timefilter.setTime({
        from: globalState.time.from,
        to: globalState.time.to,
      });
    }

    const { filters, query } = getState();

    setAiopsListState({
      ...aiopsListState,
      searchQuery: createMergedEsQuery(query, filters, dataView, uiSettings),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(globalState?.time), timefilter]);

  const loadCategories = useCallback(async () => {
    const { title: index, timeFieldName: timeField } = dataView;

    if (selectedField === undefined || timeField === undefined) {
      return;
    }

    cancelRequest();

    setLoading(true);
    setData(null);

    try {
      const { categories, sparkLinesPerCategory: sparkLines } = await runCategorizeRequest(
        index,
        selectedField.name,
        timeField,
        earliest,
        latest,
        searchQuery,
        intervalMs
      );

      if (mounted.current === true) {
        setData({ categories, sparkLines });
      }
    } catch (error) {
      toasts.addError(error, {
        title: i18n.translate('xpack.aiops.logCategorization.errorLoadingCategories', {
          defaultMessage: 'Error loading categories',
        }),
      });
    }

    if (mounted.current === true) {
      setLoading(false);
    }
  }, [
    dataView,
    selectedField,
    cancelRequest,
    runCategorizeRequest,
    earliest,
    latest,
    searchQuery,
    intervalMs,
    toasts,
  ]);

  const onAddFilter = useCallback(
    (values: Filter, alias?: string) => {
      const filter = buildEmptyFilter(false, dataView.id);
      if (alias) {
        filter.meta.alias = alias;
      }
      filter.query = values.query;
      filterManager.addFilters([filter]);
    },
    [dataView, filterManager]
  );

  useEffect(() => {
    if (documentStats.documentCountStats?.buckets) {
      randomSampler.setDocCount(documentStats.totalCount);
      setEventRate(
        Object.entries(documentStats.documentCountStats.buckets).map(([key, docCount]) => ({
          key: +key,
          docCount,
        }))
      );
      setData(null);
      loadCategories();
    }
  }, [
    documentStats,
    earliest,
    latest,
    searchQueryLanguage,
    searchString,
    searchQuery,
    loadCategories,
    randomSampler,
  ]);

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h2 id="flyoutTitle">
                <FormattedMessage
                  id="xpack.aiops.categorizeFlyout.title"
                  defaultMessage="Pattern analysis of {name}"
                  values={{ name: selectedField.name }}
                />
              </h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false} css={{ marginTop: euiTheme.size.xs }}>
            <TechnicalPreviewBadge />
          </EuiFlexItem>
          <EuiFlexItem />
          <EuiFlexItem grow={false}>
            <SamplingMenu randomSampler={randomSampler} reload={() => forceRefresh()} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody data-test-subj={'mlJobSelectorFlyoutBody'}>
        {loading === true ? <LoadingCategorization onClose={onClose} /> : null}

        <InformationText
          loading={loading}
          categoriesLength={data?.categories?.length ?? null}
          eventRateLength={eventRate.length}
          fieldSelected={selectedField !== null}
        />

        {loading === false && data !== null && data.categories.length > 0 ? (
          <CategoryTable
            categories={data.categories}
            aiopsListState={aiopsListState}
            dataViewId={dataView.id!}
            eventRate={eventRate}
            sparkLines={data.sparkLines}
            selectedField={selectedField}
            pinnedCategory={pinnedCategory}
            setPinnedCategory={setPinnedCategory}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            timefilter={timefilter}
            onAddFilter={onAddFilter}
            onClose={onClose}
            enableRowActions={false}
          />
        ) : null}
      </EuiFlyoutBody>
    </>
  );
};
