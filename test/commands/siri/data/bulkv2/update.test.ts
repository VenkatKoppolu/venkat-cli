/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Update from '../../../../src/commands/siri/data/bulkv2/update.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';
import { JobInfo } from '../../../../src/types/bulkv2.js';

describe('siri:data:bulkv2:update', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2OperateStub: sinon.SinonStub;

  const mockJobResponse: JobInfo = {
    id: '750xx0000000045AAA',
    operation: 'update',
    object: 'Account',
    createdById: '005xx000001Sv1',
    createdDate: new Date(),
    systemModstamp: new Date(),
    state: 'UploadComplete',
    concurrencyMode: 'Parallel',
    contentType: 'CSV',
    apiVersion: 59,
    contentUrl: '/services/data/v59.0/jobs/ingest/750xx0000000045AAA',
    numberRecordsProcessed: 50,
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

  it('should execute update command with required flags', async () => {
    const cmd = new BulkV2Update([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const result = await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'update.csv',
    ]);

    expect(result.operation).to.equal('update');
    expect(result.id).to.equal('750xx0000000045AAA');
  });

  it('should pass update operation to BulkV2.operate', async () => {
    const cmd = new BulkV2Update([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'update.csv',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.operation).to.equal('update');
  });

  it('should stop spinner on error', async () => {
    bulkV2OperateStub.rejects(new Error('API Error'));
    const cmd = new BulkV2Update([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
        '--csvfile',
        'update.csv',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });
});
