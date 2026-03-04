/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect } from 'chai';
import sinon from 'sinon';
import { stubInterface } from '@salesforce/ts-sinon';
import { Connection, Org } from '@salesforce/core';
import SiriDataExportFiles from '../../../src/commands/siri/data/export/files.js';

describe('siri:data:export:files', () => {
  let sandbox: sinon.SinonSandbox;
  let orgStub: sinon.SinonStubbedInstance<Org>;
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  const testDir = path.join(__dirname, '../../.export-cmd-test');

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    connectionStub = stubInterface<Connection>(sandbox);
    orgStub = stubInterface<Org>(sandbox);
    orgStub.getConnection.returns(connectionStub);

    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    sandbox.restore();
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should execute export files command with attachment type', async () => {
    const cmd = new SiriDataExportFiles([]);
    sinon.stub(cmd, 'spinner').get(() => ({
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    }));
    sinon.stub(cmd, 'log');

    sinon.stub(Org, 'create').resolves(orgStub);

    const mockRecords = [
      { id: '001', name: 'file1.txt', body: Buffer.from('test content').toString('base64') },
    ];
    (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

    const result = await (cmd as any).run([
      '--target-org',
      'myorg',
      '--filetype',
      'attachment',
      '--query',
      'SELECT Id, Name, Body FROM Attachment',
      '--output-dir',
      testDir,
    ]);

    expect(result).to.be.undefined;
  });

  it('should require filetype flag', async () => {
    const cmd = new SiriDataExportFiles([]);
    sinon.stub(cmd, 'spinner').get(() => ({
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    }));

    sinon.stub(Org, 'create').resolves(orgStub);

    try {
      await (cmd as any).run([
        '--target-org',
        'myorg',
        '--query',
        'SELECT Id, Name, Body FROM Attachment',
        '--output-dir',
        testDir,
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should require query flag', async () => {
    const cmd = new SiriDataExportFiles([]);
    sinon.stub(cmd, 'spinner').get(() => ({
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    }));

    sinon.stub(Org, 'create').resolves(orgStub);

    try {
      await (cmd as any).run([
        '--target-org',
        'myorg',
        '--filetype',
        'attachment',
        '--output-dir',
        testDir,
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should require output-dir flag', async () => {
    const cmd = new SiriDataExportFiles([]);
    sinon.stub(cmd, 'spinner').get(() => ({
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    }));

    sinon.stub(Org, 'create').resolves(orgStub);

    try {
      await (cmd as any).run([
        '--target-org',
        'myorg',
        '--filetype',
        'attachment',
        '--query',
        'SELECT Id, Name, Body FROM Attachment',
      ]);
      expect.fail('Should have thrown error');
    } catch (err) {
      expect((err as any).message).to.include('Required flag');
    }
  });

  it('should output JSON format when json flag is set', async () => {
    const cmd = new SiriDataExportFiles([]);
    const logStub = sinon.stub();
    const spinnerStub = {
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    };
    sinon.stub(cmd, 'spinner').get(() => spinnerStub);
    sinon.stub(cmd, 'log').callsFake(logStub);

    sinon.stub(Org, 'create').resolves(orgStub);

    const mockRecords = [{ id: '001', name: 'file1.txt', body: Buffer.from('test').toString('base64') }];
    (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

    await (cmd as any).run([
      '--target-org',
      'myorg',
      '--filetype',
      'attachment',
      '--query',
      'SELECT Id, Name, Body FROM Attachment',
      '--output-dir',
      testDir,
      '--json',
    ]);

    const jsonCall = logStub.getCalls().find((call) => {
      const arg = call.firstArg;
      return typeof arg === 'string' && arg.includes('filesExported');
    });

    expect(jsonCall).to.exist;
  });

  it('should format output with file export summary', async () => {
    const cmd = new SiriDataExportFiles([]);
    const logStub = sinon.stub();
    const spinnerStub = {
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    };
    sinon.stub(cmd, 'spinner').get(() => spinnerStub);
    sinon.stub(cmd, 'log').callsFake(logStub);

    sinon.stub(Org, 'create').resolves(orgStub);

    const mockRecords = [{ id: '001', name: 'file1.txt', body: Buffer.from('test content').toString('base64') }];
    (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

    await (cmd as any).run([
      '--target-org',
      'myorg',
      '--filetype',
      'attachment',
      '--query',
      'SELECT Id, Name, Body FROM Attachment',
      '--output-dir',
      testDir,
    ]);

    const summaryCall = logStub.getCalls().find((call) => {
      const arg = call.firstArg;
      return typeof arg === 'string' && arg.includes('File Export Summary');
    });

    expect(summaryCall).to.exist;
  });

  it('should support contentdocument file type', async () => {
    const cmd = new SiriDataExportFiles([]);
    sinon.stub(cmd, 'spinner').get(() => ({
      start: sinon.stub(),
      stop: sinon.stub(),
      status: '',
    }));
    sinon.stub(cmd, 'log');

    sinon.stub(Org, 'create').resolves(orgStub);

    const mockRecords = [
      { id: '069xx', 'ContentDocument.Title': 'doc.pdf', versionData: Buffer.from('pdf data').toString('base64') },
    ];
    (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

    await (cmd as any).run([
      '--target-org',
      'myorg',
      '--filetype',
      'contentdocument',
      '--query',
      'SELECT Id, ContentDocument.Title, VersionData FROM ContentVersion',
      '--output-dir',
      testDir,
    ]);

    expect((connectionStub.query as sinon.SinonStub).called).to.be.true;
  });
});
