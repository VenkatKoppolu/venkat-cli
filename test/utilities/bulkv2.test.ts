/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'node:fs';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Connection, SfError } from '@salesforce/core';
import { BulkV2 } from '../../src/utilities/bulkv2.js';
import { BulkV2Input } from '../../src/types/bulkv2.js';

describe('BulkV2 Utility', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkv2: BulkV2;
  let fsStub: sinon.SinonStub;

  beforeEach(() => {
    connectionStub = stubInterface<Connection>(sinon);
    connectionStub.accessToken = 'test-token';
    connectionStub.instanceUrl = 'https://test.salesforce.com';
    connectionStub.getApiVersion.returns('59.0');

    bulkv2 = new BulkV2(connectionStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('generateRequestBody', () => {
    it('should generate correct body for insert operation', () => {
      const input: BulkV2Input = {
        sobjecttype: 'Account',
        operation: 'insert',
        lineending: 'LF',
        delimiter: 'COMMA',
      };

      const body = bulkv2.generateRequestBody(input);
      const parsed = JSON.parse(body);

      expect(parsed).to.deep.equal({
        object: 'Account',
        operation: 'insert',
        lineEnding: 'LF',
        columnDelimiter: 'COMMA',
      });
    });

    it('should generate correct body for upsert operation', () => {
      const input: BulkV2Input = {
        sobjecttype: 'Account',
        operation: 'upsert',
        externalid: 'External_Id__c',
        lineending: 'LF',
        delimiter: 'COMMA',
      };

      const body = bulkv2.generateRequestBody(input);
      const parsed = JSON.parse(body);

      expect(parsed).to.deep.equal({
        object: 'Account',
        externalIdFieldName: 'External_Id__c',
        operation: 'upsert',
        lineEnding: 'LF',
        columnDelimiter: 'COMMA',
      });
    });

    it('should generate correct body for query operation', () => {
      const input: BulkV2Input = {
        sobjecttype: 'Account',
        operation: 'query',
        query: 'SELECT Id FROM Account',
        lineending: 'LF',
        delimiter: 'COMMA',
      };

      const body = bulkv2.generateRequestBody(input);
      const parsed = JSON.parse(body);

      expect(parsed).to.deep.equal({
        operation: 'query',
        query: 'SELECT Id FROM Account',
        contentType: 'CSV',
        columnDelimiter: 'COMMA',
        lineEnding: 'LF',
      });
    });

    it('should use defaults when values are not provided', () => {
      const input: BulkV2Input = {
        sobjecttype: 'Account',
        operation: 'update',
      };

      const body = bulkv2.generateRequestBody(input);
      const parsed = JSON.parse(body);

      expect(parsed.lineEnding).to.equal('LF');
      expect(parsed.columnDelimiter).to.equal('COMMA');
    });
  });

  describe('checkFileSizeAndAct', () => {
    beforeEach(() => {
      fsStub = sinon.stub(fs, 'statSync');
    });

    it('should return single file if size is less than 20MB', () => {
      // 10MB file
      fsStub.returns({ size: 10 * 1024 * 1024 } as fs.Stats);
      sinon.stub(fs, 'readFileSync').returns('line1\nline2\nline3' as any);

      const result = bulkv2.checkFileSizeAndAct('test.csv');
      expect(result).to.deep.equal(['test.csv']);
    });

    it('should split large files into multiple chunks', () => {
      // 40MB file
      fsStub.returns({ size: 40 * 1024 * 1024 } as fs.Stats);
      const largeContent = Array(100)
        .fill('Id,Name\n123,Test')
        .join('\n');
      sinon.stub(fs, 'readFileSync').returns(largeContent as any);
      sinon.stub(fs, 'writeFileSync');

      const result = bulkv2.checkFileSizeAndAct('test.csv');
      expect(result.length).to.be.greaterThan(1);
      expect(result[0]).to.equal('temp0.csv');
    });
  });

  describe('generateConfig', () => {
    it('should throw error when access token is missing', () => {
      const stubConnWithoutToken = stubInterface<Connection>(sinon);
      stubConnWithoutToken.accessToken = undefined;
      const testBulkV2 = new BulkV2(stubConnWithoutToken);

      expect(() => {
        (testBulkV2 as any).generateConfig('application/json');
      }).to.throw(SfError);
    });

    it('should include correct authorization header', () => {
      const config = (bulkv2 as any).generateConfig('application/json');

      expect(config.headers['Authorization']).to.equal('Bearer test-token');
      expect(config.headers['Content-Type']).to.equal('application/json');
    });
  });

  describe('error handling', () => {
    it('should throw error in moreResults when request fails', async () => {
      sinon.stub(require('axios') as any, 'get').rejects(new Error('Network error'));

      try {
        await (bulkv2 as any).moreResults('http://test.com', 'locator', 'output.csv');
        expect.fail('Should have thrown error');
      } catch (err) {
        expect((err as any).name).to.equal('FetchResultsError');
      }
    });
  });
});
