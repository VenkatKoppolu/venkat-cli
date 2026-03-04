/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec } from 'node:child_process';
import * as path from 'node:path';
import { expect } from 'chai';

describe('NUT: siri:data:bulkv2:insert', () => {
  it('should return success for valid insert', (done) => {
    const csvFile = path.join(__dirname, 'fixtures', 'valid.csv');
    const cmd = `sf siri:data:bulkv2:insert --sobjecttype Account --csvfile ${csvFile}`;

    exec(cmd, (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('UploadComplete');
      done();
    });
  });
});
