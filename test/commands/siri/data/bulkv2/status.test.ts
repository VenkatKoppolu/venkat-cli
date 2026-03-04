/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Status from '../../../../src/commands/siri/data/bulkv2/status.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';
import { JobInfo } from '../../../../src/types/bulkv2.js';

describe('siri:data:bulkv2:status', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2StatusStub: sinon.SinonStub;

  const mockJobStatus: JobInfo = {
    id: '750xx0000000049AAA',
    operation: 'insert',
    object: 'Account',
    createdById: '005xx000001Sv1',
    createdDate: new Date(),
    systemModstamp: new Date(),
    state: 'InProgress',
    concurrencyMode: 'Parallel',
    contentType: 'CSV',
    apiVersion: 59,
    contentUrl: '/services/data/v59.0/jobs/ingest/750xx0000000049AAA',
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

    bulkV2StatusStub = sinon.stub(BulkV2.prototype, 'status').resolves(mockJobStatus);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should execute status command with jobid flag', async () => {
    const cmd = new BulkV2Status([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');
    sinon.stub(cmd, 'styledHeader');
    sinon.stub(cmd, 'styledObject');

    const result = await (cmd as any).run([
      '--jobid',
      '750xx0000000049AAA',
    ]);

    expect(result.id).to.equal('750xx0000000049AAA');
  });

  it('should require jobid flag', async () => {
    const cmd = new BulkV2Status([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([]);
      expect.fail('Should require jobid');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should call BulkV2.status with correct jobid', async () => {
    const cmd = new BulkV2Status([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');
    sinon.stub(cmd, 'styledHeader');
    sinon.stub(cmd, 'styledObject');

    const jobId = '750xx0000000049AAA';
    await (cmd as any).run(['--jobid', jobId]);

    const callArgs = bulkV2StatusStub.getCall(0).args;
    expect(callArgs[0]).to.equal(jobId);
  });

  it('should display job status details', async () => {
    const cmd = new BulkV2Status([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');
    const styledHeaderStub = sinon.stub(cmd, 'styledHeader');
    sinon.stub(cmd, 'styledObject');

    await (cmd as any).run(['--jobid', '750xx0000000049AAA']);

    expect(styledHeaderStub.called).to.be.true;
  });

  it('should stop spinner on error', async () => {
    bulkV2StatusStub.rejects(new Error('Status Error'));
    const cmd = new BulkV2Status([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run(['--jobid', '750xx0000000049AAA']);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });
});
