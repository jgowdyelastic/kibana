/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import type { UpdateListSchema, ListSchema } from '@kbn/securitysolution-io-ts-list-types';
import { LIST_URL } from '@kbn/securitysolution-list-constants';

import { getCreateMinimalListSchemaMock } from '@kbn/lists-plugin/common/schemas/request/create_list_schema.mock';
import { getListResponseMockWithoutAutoGeneratedValues } from '@kbn/lists-plugin/common/schemas/response/list_schema.mock';
import { getUpdateMinimalListSchemaMock } from '@kbn/lists-plugin/common/schemas/request/update_list_schema.mock';
import {
  createListsIndex,
  deleteListsIndex,
  removeListServerGeneratedProperties,
} from '../../../utils';

import { FtrProviderContext } from '../../../../../ftr_provider_context';

export default ({ getService }: FtrProviderContext) => {
  const supertest = getService('supertest');
  const log = getService('log');
  const retry = getService('retry');
  const config = getService('config');
  const ELASTICSEARCH_USERNAME = config.get('servers.kibana.username');

  describe('@ess @serverless update_lists', () => {
    describe('update lists', () => {
      beforeEach(async () => {
        await createListsIndex(supertest, log);
      });

      afterEach(async () => {
        await deleteListsIndex(supertest, log);
      });

      it('should update a single list property of name using an id', async () => {
        // create a simple list
        await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // update a simple list's name
        const updatedList: UpdateListSchema = {
          ...getUpdateMinimalListSchemaMock(),
          name: 'some other name',
        };

        const { body } = await supertest
          .put(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedList)
          .expect(200);

        const outputList: Partial<ListSchema> = {
          ...getListResponseMockWithoutAutoGeneratedValues(ELASTICSEARCH_USERNAME),
          name: 'some other name',
          version: 2,
        };
        const bodyToCompare = removeListServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(outputList);
      });

      it('should update a single list property of name using an auto-generated id', async () => {
        const { id, ...listNoId } = getCreateMinimalListSchemaMock();
        // create a simple list with no id which will use an auto-generated id
        const { body: createListBody } = await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(listNoId)
          .expect(200);

        // update a simple list's name
        const updatedList: UpdateListSchema = {
          ...getUpdateMinimalListSchemaMock(),
          id: createListBody.id,
          name: 'some other name',
        };
        const { body } = await supertest
          .put(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedList)
          .expect(200);

        const outputList: Partial<ListSchema> = {
          ...getListResponseMockWithoutAutoGeneratedValues(ELASTICSEARCH_USERNAME),
          name: 'some other name',
          version: 2,
        };
        const bodyToCompare = removeListServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(outputList);

        await retry.waitFor('updates should be persistent', async () => {
          const { body: list } = await supertest
            .get(LIST_URL)
            .query({ id: createListBody.id })
            .set('kbn-xsrf', 'true');

          expect(list.version).to.be(2);
          expect(list.name).to.be('some other name');
          return true;
        });
      });

      it('should remove unspecified meta field', async () => {
        const { id, ...listNoId } = getCreateMinimalListSchemaMock();
        // create a simple list with no id which will use an auto-generated id
        const { body: createListBody } = await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send({ ...listNoId, meta: { test: true } });

        const updatedList: UpdateListSchema = {
          ...getUpdateMinimalListSchemaMock(),
          id: createListBody.id,
          name: 'some other name',
        };
        const { body: updatedListBody } = await supertest
          .put(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedList);

        expect(updatedListBody.meta).to.eql(undefined);

        await retry.waitFor('updates should be persistent', async () => {
          const { body: list } = await supertest
            .get(LIST_URL)
            .query({ id: createListBody.id })
            .set('kbn-xsrf', 'true');

          expect(list.meta).to.eql(undefined);
          return true;
        });
      });

      it('should update meta field', async () => {
        const { id, ...listNoId } = getCreateMinimalListSchemaMock();
        // create a simple list with no id which will use an auto-generated id
        const { body: createListBody } = await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send({ ...listNoId, meta: { test: true } });

        const updatedList: UpdateListSchema = {
          ...getUpdateMinimalListSchemaMock(),
          id: createListBody.id,
          meta: { foo: 'some random value' },
        };
        const { body: updatedListBody } = await supertest
          .put(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(updatedList);

        expect(updatedListBody.meta).to.eql({ foo: 'some random value' });

        await retry.waitFor('updates should be persistent', async () => {
          const { body: list } = await supertest
            .get(LIST_URL)
            .query({ id: createListBody.id })
            .set('kbn-xsrf', 'true');

          expect(list.meta).to.eql({ foo: 'some random value' });
          return true;
        });
      });

      it('should change the version of a list when it updates a property', async () => {
        // create a simple list
        await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // update a simple list property of name and description
        const updatedList: UpdateListSchema = {
          ...getUpdateMinimalListSchemaMock(),
          name: 'some other name',
          description: 'some other description',
        };

        const { body } = await supertest.put(LIST_URL).set('kbn-xsrf', 'true').send(updatedList);

        const outputList: Partial<ListSchema> = {
          ...getListResponseMockWithoutAutoGeneratedValues(ELASTICSEARCH_USERNAME),
          name: 'some other name',
          description: 'some other description',
          version: 2,
        };

        const bodyToCompare = removeListServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(outputList);
      });

      it('should give a 404 if it is given a fake id', async () => {
        const simpleList: UpdateListSchema = {
          ...getUpdateMinimalListSchemaMock(),
          id: '5096dec6-b6b9-4d8d-8f93-6c2602079d9d',
        };
        const { body } = await supertest
          .put(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(simpleList)
          .expect(404);

        expect(body).to.eql({
          status_code: 404,
          message: 'list id: "5096dec6-b6b9-4d8d-8f93-6c2602079d9d" not found',
        });
      });

      describe('version control OCC', () => {
        it('should return error if _version in payload mismatched', async () => {
          const { id, ...listNoId } = getCreateMinimalListSchemaMock();
          // create a simple list with no id which will use an auto-generated id
          const { body: createListBody } = await supertest
            .post(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send(listNoId)
            .expect(200);

          // update a simple list's name
          const updatedList: UpdateListSchema = {
            ...getUpdateMinimalListSchemaMock(),
            id: createListBody.id,
            name: 'some other name',
            _version: createListBody._version,
          };
          await supertest.put(LIST_URL).set('kbn-xsrf', 'true').send(updatedList).expect(200);

          // next update with the same _version should return 409
          const { body: errorBody } = await supertest
            .put(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send(updatedList)
            .expect(409);

          expect(errorBody.message).to.equal(
            'Conflict: versions mismatch. Provided versions:{"if_primary_term":1,"if_seq_no":0} does not match {"if_primary_term":1,"if_seq_no":1}'
          );
        });

        it('should return updated _version', async () => {
          const { id, ...listNoId } = getCreateMinimalListSchemaMock();
          // create a simple list with no id which will use an auto-generated id
          const { body: createListBody } = await supertest
            .post(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send(listNoId)
            .expect(200);

          // update a simple list's name
          const updatedList: UpdateListSchema = {
            ...getUpdateMinimalListSchemaMock(),
            id: createListBody.id,
            name: 'some other name',
            _version: createListBody._version,
          };
          const { body: updatedListBody } = await supertest
            .put(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send(updatedList)
            .expect(200);

          // version should be different
          expect(updatedListBody._version).not.to.be(createListBody._version);

          // next update with the new version should be successful
          await supertest
            .put(LIST_URL)
            .set('kbn-xsrf', 'true')
            .send({ ...updatedList, _version: updatedListBody._version })
            .expect(200);
        });
      });
    });
  });
};
