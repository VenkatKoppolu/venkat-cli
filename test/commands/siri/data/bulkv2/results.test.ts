/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import BulkV2Results from '../../../../src/commands/siri/data/bulkv2/results.js';
import { BulkV2 } from '../../../../src/utilities/bulkv2.js';

describe('siri:data:bulkv2:results', () => {
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let bulkV2ResultsStub: sinon.SinonStub;

  beforeEach(() => {
    connectionStub = stubInterface<Connection>(sinon);
    connectionStub.accessToken = 'test-token';
    connectionStub.instanceUrl = 'https://test.salesforce.com';
    connectionStub.getApiVersion.returns('59.0');

    sinon.stub(Org, 'create').resolves({
      getConnection: () => connectionStub,
    } as any);

    bulkV2ResultsStub = sinon.stub(BulkV2.prototype, 'results').resolves(true);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should execute results command with required flags', async () => {
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--jobid',
      '750xx0000000049AAA',
      '--outputfile',
      'results.csv',
    ]);

    expect(bulkV2ResultsStub.called).to.be.true;
  });

  it('should require jobid flag', async () => {
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--outputfile',
        'results.csv',
      ]);
      expect.fail('Should require jobid');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should require outputfile flag', async () => {
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--jobid',
        '750xx0000000049AAA',
      ]);
      expect.fail('Should require outputfile');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should pass jobid, type and outputfile to BulkV2.results', async () => {
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    const jobId = '750xx0000000049AAA';
    const outputFile = 'results.csv';
    const resultType = 'success';

    await (cmd as any).run([
      '--jobid',
      jobId,
      '--outputfile',
      outputFile,
      '--type',
      resultType,
    ]);

    const callArgs = bulkV2ResultsStub.getCall(0).args;
    expect(callArgs[0]).to.equal(jobId);
    expect(callArgs[1]).to.equal(resultType.toUpperCase());
    expect(callArgs[2]).to.equal(outputFile);
  });

  it('should use default type when not provided', async () => {
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--jobid',
      '750xx0000000049AAA',
      '--outputfile',
      'results.csv',
    ]);

    const callArgs = bulkV2ResultsStub.getCall(0).args;
    expect(callArgs[1]).to.equal('LF');
  });

  it('should log success message when results written', async () => {
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    sinon.stub(cmd.spinner, 'stop');
    const logStub = sinon.stub(cmd, 'log');

    await (cmd as any).run([
      '--jobid',
      '750xx0000000049AAA',
      '--outputfile',
      'results.csv',
    ]);

    expect(logStub.called).to.be.true;
  });

  it('should stop spinner on error', async () => {
    bulkV2ResultsStub.rejects(new Error('Results Error'));
    const cmd = new BulkV2Results([]);
    sinon.stub(cmd.spinner, 'start');
    const stopStub = sinon.stub(cmd.spinner, 'stop');

    try {
      await (cmd as any).run([
        '--jobid',
        '750xx0000000049AAA',
        '--outputfile',
        'results.csv',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect(stopStub.called).to.be.true;
    }
  });
});
