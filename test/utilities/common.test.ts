/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from 'chai';
import { Common } from '../../src/utilities/common.js';

describe('Common Utility', () => {
  describe('wait', () => {
    it('should wait for the specified milliseconds', async () => {
      const startTime = Date.now();
      await Common.wait(100);
      const elapsed = Date.now() - startTime;

      // Allow some variance (±10ms)
      expect(elapsed).to.be.at.least(90);
      expect(elapsed).to.be.at.most(150);
    });

    it('should resolve with undefined', async () => {
      const result = await Common.wait(10);
      expect(result).to.be.undefined;
    });
  });

  describe('cwd', () => {
    it('should have cwd property', () => {
      expect(Common.cwd).to.exist;
      expect(typeof Common.cwd).to.equal('string');
    });

    it('should return current working directory', () => {
      expect(Common.cwd).to.equal(process.cwd());
    });
  });
});
