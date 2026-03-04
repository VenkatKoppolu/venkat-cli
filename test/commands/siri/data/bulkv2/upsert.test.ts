/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Upsert from '../../../../src/commands/siri/data/bulkv2/upsert.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';
import { JobInfo } from '../../../../src/types/bulkv2.js';

describe('siri:data:bulkv2:upsert', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2OperateStub: sinon.SinonStub;

  const mockJobResponse: JobInfo = {
    id: '750xx0000000046AAA',
    operation: 'upsert',
    object: 'Account',
    createdById: '005xx000001Sv1',
    createdDate: new Date(),
    systemModstamp: new Date(),
    state: 'UploadComplete',
    concurrencyMode: 'Parallel',
    contentType: 'CSV',
    apiVersion: 59,
    contentUrl: '/services/data/v59.0/jobs/ingest/750xx0000000046AAA',
    externalIdFieldName: 'External_Id__c',
    numberRecordsProcessed: 75,
    numberRecordsFailed: 0,
  };

  beforeEach(() => {
    connectionStub = stubInterface<Connection>(sinon);
    connectionStub.accessToken = 'test-token';
    connectionStub.instanceUrl = 'https://test.salesforce.com';
    connectionStub.getApiVersion.returns('59.0');

    sinon.stub(Org, 'create').resolves({
      getConnection: () => connectionStub,
    } as any);

    bulkV2OperateStub = sinon.stub(BulkV2.prototype, 'operate').resolves(mockJobResponse);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should execute upsert command with required flags', async () => {
    const cmd = new BulkV2Upsert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const result = await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'upsert.csv',
      '--externalid',
      'External_Id__c',
    ]);

    expect(result.operation).to.equal('upsert');
    expect(result.externalIdFieldName).to.equal('External_Id__c');
  });

  it('should require externalid flag for upsert', async () => {
    const cmd = new BulkV2Upsert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
        '--csvfile',
        'upsert.csv',
      ]);
      expect.fail('Should require externalid');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should pass external ID to BulkV2.operate', async () => {
    const cmd = new BulkV2Upsert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'upsert.csv',
      '--externalid',
      'Custom_External_Id__c',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.operation).to.equal('upsert');
    expect(callArgs.externalid).to.equal('Custom_External_Id__c');
  });

  it('should stop spinner on error', async () => {
    bulkV2OperateStub.rejects(new Error('API Error'));
    const cmd = new BulkV2Upsert([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
        '--csvfile',
        'upsert.csv',
        '--externalid',
        'External_Id__c',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });
});
