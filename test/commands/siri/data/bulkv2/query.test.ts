/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Query from '../../../../src/commands/siri/data/bulkv2/query.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';
import { JobInfo } from '../../../../src/types/bulkv2.js';

describe('siri:data:bulkv2:query', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2OperateStub: sinon.SinonStub;

  const mockJobResponse: JobInfo = {
    id: '750xx0000000048AAA',
    operation: 'query',
    object: 'Account',
    createdById: '005xx000001Sv1',
    createdDate: new Date(),
    systemModstamp: new Date(),
    state: 'JobComplete',
    concurrencyMode: 'Parallel',
    contentType: 'CSV',
    apiVersion: 59,
    contentUrl: '/services/data/v59.0/jobs/query/750xx0000000048AAA',
    numberRecordsProcessed: 1000,
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

  it('should execute query command with required flags', async () => {
    const cmd = new BulkV2Query([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const result = await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--query',
      'SELECT Id, Name FROM Account',
    ]);

    expect(result.operation).to.equal('query');
    expect(result.state).to.equal('JobComplete');
  });

  it('should require query flag', async () => {
    const cmd = new BulkV2Query([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
      ]);
      expect.fail('Should require query flag');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should pass query to BulkV2.operate', async () => {
    const cmd = new BulkV2Query([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const soql = 'SELECT Id, Name FROM Account LIMIT 100';
    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--query',
      soql,
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.query).to.equal(soql);
    expect(callArgs.operation).to.equal('query');
  });

  it('should use outputfile flag when provided', async () => {
    const cmd = new BulkV2Query([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--query',
      'SELECT Id FROM Account',
      '--outputfile',
      'results.csv',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.csvfile).to.equal('results.csv');
  });

  it('should stop spinner on error', async () => {
    bulkV2OperateStub.rejects(new Error('Query Error'));
    const cmd = new BulkV2Query([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
        '--query',
        'SELECT Id FROM Account',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });
});
