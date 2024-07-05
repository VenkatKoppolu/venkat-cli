import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import Insert from '../../../../../src/commands/siri/data/bulkv2/insert.js';

describe('hello world', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello world', async () => {
    await Insert.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output.Id);
  });

  it('runs hello world with --json and no provided name', async () => {
    const result = await Insert.run([]);
    expect(result.Id);
  });

  it('runs hello world --name Astro', async () => {
    await Insert.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output.Id);
  });

  it('runs hello world --name Astro --json', async () => {
    const result = await Insert.run(['--name', 'Astro', '--json']);
    expect(result.Id);
  });
});
