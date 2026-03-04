/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Delete from '../../../../src/commands/siri/data/bulkv2/delete.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';
import { JobInfo } from '../../../../src/types/bulkv2.js';

describe('siri:data:bulkv2:delete', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2OperateStub: sinon.SinonStub;
  let checkFileSizeStub: sinon.SinonStub;

  const mockJobResponse: JobInfo = {
    id: '750xx0000000047AAA',
    operation: 'delete',
    object: 'Account',
    createdById: '005xx000001Sv1',
    createdDate: new Date(),
    systemModstamp: new Date(),
    state: 'UploadComplete',
    concurrencyMode: 'Parallel',
    contentType: 'CSV',
    apiVersion: 59,
    contentUrl: '/services/data/v59.0/jobs/ingest/750xx0000000047AAA',
    numberRecordsProcessed: 25,
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
    checkFileSizeStub = sinon.stub(BulkV2.prototype, 'checkFileSizeAndAct').returns(['delete.csv']);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should execute delete command with required flags', async () => {
    const cmd = new BulkV2Delete([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const result = await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'delete.csv',
    ]);

    expect(Array.isArray(result)).to.be.true;
    expect(result[0].operation).to.equal('delete');
  });

  it('should use hardDelete operation when hardelete flag is set', async () => {
    const cmd = new BulkV2Delete([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'delete.csv',
      '--hardelete',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.operation).to.equal('hardDelete');
  });

  it('should use delete operation by default', async () => {
    const cmd = new BulkV2Delete([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'delete.csv',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.operation).to.equal('delete');
  });

  it('should check file size before deletion', async () => {
    const cmd = new BulkV2Delete([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'delete.csv',
    ]);

    expect(checkFileSizeStub.calledOnce).to.be.true;
  });

  it('should return array of job responses', async () => {
    bulkV2OperateStub.resolves(mockJobResponse);
    const cmd = new BulkV2Delete([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const result = await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'delete.csv',
    ]);

    expect(Array.isArray(result)).to.be.true;
    expect(result.length).to.be.greaterThan(0);
  });

  it('should stop spinner on error', async () => {
    bulkV2OperateStub.rejects(new Error('API Error'));
    const cmd = new BulkV2Delete([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
        '--csvfile',
        'delete.csv',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });
});
