import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { BulkV2InsertResult } from '../../../../../src/commands/siri/data/bulkv2/insert.js';

let testSession: TestSession;

describe('hello world NUTs', () => {
  before('prepare session', async () => {
    testSession = await TestSession.create();
  });

  after(async () => {
    await testSession?.clean();
  });

  it('should say hello to the world', () => {
    const result: BulkV2InsertResult = execCmd<BulkV2InsertResult>('hello world --json', { ensureExitCode: 0 })
      .jsonOutput?.result;
    expect(result?.Id);
  });

  it('should say hello to a given person', () => {
    const result: BulkV2InsertResult = execCmd<BulkV2InsertResult>('hello world --name Astro --json', {
      ensureExitCode: 0,
    }).jsonOutput?.result;
    expect(result?.Id);
  });
});
