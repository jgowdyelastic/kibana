/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../../ftr_provider_context';

export default function ({ getPageObjects, getService }: FtrProviderContext) {
  const elasticChart = getService('elasticChart');
  const esArchiver = getService('esArchiver');
  const aiops = getService('aiops');
  const browser = getService('browser');
  const retry = getService('retry');

  // aiops lives in the ML UI so we need some related services.
  const ml = getService('ml');

  async function retrySwitchTab(tabIndex: number, seconds: number) {
    await retry.tryForTime(seconds * 1000, async () => {
      await browser.switchTab(tabIndex);
    });
  }

  describe('log pattern analysis', async function () {
    let tabsCount = 1;

    afterEach(async () => {
      if (tabsCount > 1) {
        await browser.closeCurrentWindow();
        await retrySwitchTab(0, 10);
        tabsCount--;
      }
    });

    before(async () => {
      await esArchiver.loadIfNeeded('x-pack/test/functional/es_archives/logstash_functional');
      await ml.testResources.createIndexPatternIfNeeded('logstash-*', '@timestamp');
      await ml.testResources.setKibanaTimeZoneToUTC();
      await ml.securityUI.loginAsMlPowerUser();
    });

    after(async () => {
      await ml.testResources.deleteIndexPatternByTitle('logstash-*');
    });

    it(`loads the log pattern analysis page`, async () => {
      // Start navigation from the base of the ML app.
      await ml.navigation.navigateToMl();
      await elasticChart.setNewChartUiDebugFlag(true);
      await aiops.logPatternAnalysisPage.navigateToIndexPatternSelection();
      await ml.jobSourceSelection.selectSourceForLogPatternAnalysisDetection('logstash-*');
      await aiops.logPatternAnalysisPage.assertLogPatternAnalysisPageExists();
    });

    it('loads categories based on field selection', async () => {
      await aiops.logPatternAnalysisPage.clickUseFullDataButton();
      await aiops.logPatternAnalysisPage.selectCategoryField('@message');
      await aiops.logPatternAnalysisPage.clickRunButton();
      await aiops.logPatternAnalysisPage.assertTotalCategoriesFound(3);
      await aiops.logPatternAnalysisPage.assertCategoryTableRows(3);

      // get category count from the first row
      const categoryCount = await aiops.logPatternAnalysisPage.getCategoryCountFromTable(0);
      await aiops.logPatternAnalysisPage.clickFilterInButton(0);

      retrySwitchTab(1, 10);
      tabsCount++;

      await aiops.logPatternAnalysisPage.assertDiscoverDocCountExists();

      // ensure the discover doc count is equal to the category count
      await aiops.logPatternAnalysisPage.assertDiscoverDocCount(categoryCount);

      // await new Promise((r) => setTimeout(r, 400000));
    });
  });
}
