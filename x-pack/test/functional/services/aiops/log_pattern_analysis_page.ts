/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import type { FtrProviderContext } from '../../ftr_provider_context';

export function LogPatternAnalysisPageProvider({ getService, getPageObject }: FtrProviderContext) {
  const retry = getService('retry');
  const testSubjects = getService('testSubjects');
  const comboBox = getService('comboBox');

  return {
    async assertLogPatternAnalysisPageExists() {
      await retry.tryForTime(30 * 1000, async () => {
        await testSubjects.existOrFail('aiopsLogPatternAnalysisPage');
      });
    },

    async navigateToIndexPatternSelection() {
      await testSubjects.click('mlMainTab logCategorization');
      await testSubjects.existOrFail('mlPageSourceSelection');
    },

    async clickUseFullDataButton() {
      await retry.tryForTime(30 * 1000, async () => {
        await testSubjects.clickWhenNotDisabledWithoutRetry('mlDatePickerButtonUseFullData');
        await testSubjects.clickWhenNotDisabledWithoutRetry('superDatePickerApplyTimeButton');
        await this.assertTotalDocumentCount('14,005');
      });
    },

    async clickRunButton() {
      await testSubjects.clickWhenNotDisabled('aiopsLogPatternAnalysisRunButton', {
        timeout: 5000,
      });
    },

    async assertQueryInput(expectedQueryString: string) {
      const aiopsQueryInput = await testSubjects.find('aiopsQueryInput');
      const actualQueryString = await aiopsQueryInput.getVisibleText();
      expect(actualQueryString).to.eql(
        expectedQueryString,
        `Expected query bar text to be '${expectedQueryString}' (got '${actualQueryString}')`
      );
    },

    async assertTotalDocumentCount(expectedFormattedTotalDocCount: string) {
      await retry.tryForTime(5000, async () => {
        const docCount = await testSubjects.getVisibleText('aiopsTotalDocCount');
        expect(docCount).to.eql(
          expectedFormattedTotalDocCount,
          `Expected total document count to be '${expectedFormattedTotalDocCount}' (got '${docCount}')`
        );
      });
    },

    async assertTotalCategoriesFound(expectedCategoryCount: number) {
      const expectedText = `${expectedCategoryCount} patterns found`;
      await retry.tryForTime(5000, async () => {
        const actualText = await testSubjects.getVisibleText('aiopsLogPatternsFoundCount');
        expect(actualText).to.eql(
          expectedText,
          `Expected patterns found count to be '${expectedText}' (got '${actualText}')`
        );
      });
    },

    async assertCategoryTableRows(expectedCategoryCount: number) {
      await retry.tryForTime(5000, async () => {
        const tableListContainer = await testSubjects.find('aiopsLogPatternsTable');
        const rows = await tableListContainer.findAllByClassName('euiTableRow');

        expect(rows.length).to.eql(
          expectedCategoryCount,
          `Expected number of rows in table to be '${expectedCategoryCount}' (got '${rows.length}')`
        );
      });
    },

    async selectCategoryField(value: string) {
      await comboBox.set(`aiopsLogPatternAnalysisCategoryField > comboBoxInput`, value);
      await this.assertCategoryFieldSelection(value);
    },

    async assertCategoryFieldSelection(expectedIdentifier: string) {
      const comboBoxSelectedOptions = await comboBox.getComboBoxSelectedOptions(
        `aiopsLogPatternAnalysisCategoryField > comboBoxInput`
      );
      const expectedOptions = [expectedIdentifier];
      expect(comboBoxSelectedOptions).to.eql(
        expectedOptions,
        `Expected a category field to be '${expectedOptions}' (got '${comboBoxSelectedOptions}')`
      );
    },

    async clickFilterInButton(rowIndex: number) {
      const tableListContainer = await testSubjects.find('aiopsLogPatternsTable', 5000);
      const rows = await tableListContainer.findAllByClassName('euiTableRow');
      const button = await rows[rowIndex].findByTestSubject('aiopsLogPatternsActionFilterInButton');
      button.click();
    },

    async getCategoryCountFromTable(rowIndex: number) {
      const tableListContainer = await testSubjects.find('aiopsLogPatternsTable', 5000);
      const rows = await tableListContainer.findAllByClassName('euiTableRow');
      const row = rows[rowIndex];
      const cells = await row.findAllByClassName('euiTableRowCell');
      return await cells[0].getVisibleText();
    },

    async assertDiscoverDocCountExists() {
      await retry.tryForTime(30 * 1000, async () => {
        await testSubjects.existOrFail('unifiedHistogramQueryHits');
      });
    },

    async assertDiscoverDocCount(expectedDocCount: string) {
      await retry.tryForTime(5000, async () => {
        const docCount = await testSubjects.getVisibleText('unifiedHistogramQueryHits');
        const formattedDocCount = docCount.replaceAll(',', '');
        expect(formattedDocCount).to.eql(
          expectedDocCount,
          `Expected discover document count to be '${expectedDocCount}' (got '${formattedDocCount}')`
        );
      });
    },
  };
}
