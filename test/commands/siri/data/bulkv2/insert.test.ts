/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Insert from '../../../../src/commands/siri/data/bulkv2/insert.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';
import { JobInfo } from '../../../../src/types/bulkv2.js';

describe('siri:data:bulkv2:insert', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2OperateStub: sinon.SinonStub;

  const mockJobResponse: JobInfo = {
    id: '750xx0000000044AAA',
    operation: 'insert',
    object: 'Account',
    createdById: '005xx000001Sv1',
    createdDate: new Date(),
    systemModstamp: new Date(),
    state: 'UploadComplete',
    concurrencyMode: 'Parallel',
    contentType: 'CSV',
    apiVersion: 59,
    contentUrl: '/services/data/v59.0/jobs/ingest/750xx0000000044AAA',
    numberRecordsProcessed: 100,
    numberRecordsFailed: 0,
  };

  beforeEach(() => {
    // Stub Org.create
    connectionStub = stubInterface<Connection>(sinon);
    connectionStub.accessToken = 'test-token';
    connectionStub.instanceUrl = 'https://test.salesforce.com';
    connectionStub.getApiVersion.returns('59.0');

    sinon.stub(Org, 'create').resolves({
      getConnection: () => connectionStub,
    } as any);

    // Stub BulkV2.operate
    bulkV2OperateStub = sinon.stub(BulkV2.prototype, 'operate').resolves(mockJobResponse);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should execute insert command with required flags and return job info', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const result = await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'test.csv',
    ]);

    expect(result.id).to.equal('750xx0000000044AAA');
    expect(result.state).to.equal('UploadComplete');
    expect(result.operation).to.equal('insert');
  });

  it('should pass correct input to BulkV2.operate', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'test.csv',
      '--lineending',
      'CRLF',
      '--columndelimiter',
      'PIPE',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.sobjecttype).to.equal('Account');
    expect(callArgs.operation).to.equal('insert');
    expect(callArgs.csvfile).to.equal('test.csv');
    expect(callArgs.lineending).to.equal('CRLF');
    expect(callArgs.delimiter).to.equal('PIPE');
  });

  it('should use default lineending when not provided', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'test.csv',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.lineending).to.equal('LF');
  });

  it('should use default columndelimiter when not provided', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'test.csv',
    ]);

    const callArgs = bulkV2OperateStub.getCall(0).args[0];
    expect(callArgs.delimiter).to.equal('COMMA');
  });

  it('should start and stop spinner', async () => {
    const cmd = new BulkV2Insert([]);
    const startStub = sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'test.csv',
    ]);

    expect(startStub.called).to.be.true;
    expect(stopStub.called).to.be.true;
  });

  it('should log job details after successful insert', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    const logStub = sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--sobjecttype',
      'Account',
      '--csvfile',
      'test.csv',
    ]);

    expect(logStub.called).to.be.true;
  });

  it('should stop spinner and throw error on failure', async () => {
    bulkV2OperateStub.rejects(new Error('API Error'));
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--sobjecttype',
        'Account',
        '--csvfile',
        'test.csv',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });

  it('should require sobjecttype flag', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run(['--csvfile', 'test.csv']);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should require csvfile flag', async () => {
    const cmd = new BulkV2Insert([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run(['--sobjecttype', 'Account']);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });
});

