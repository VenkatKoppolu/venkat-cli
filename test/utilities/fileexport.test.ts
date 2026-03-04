/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect } from 'chai';
import sinon from 'sinon';
import { Connection, SfError } from '@salesforce/core';
import { stubInterface } from '@salesforce/ts-sinon';
import { FileExport, FileExportOptions } from '../../../src/utilities/fileexport.js';

describe('FileExport Utility', () => {
  let sandbox: sinon.SinonSandbox;
  let connectionStub: sinon.SinonStubbedInstance<Connection>;
  let fileExport: FileExport;
  const testDir = path.join(__dirname, '../../.fileexport-test');

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    connectionStub = stubInterface<Connection>(sandbox);
    fileExport = new FileExport(connectionStub);

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

  describe('exportFiles', () => {
    it('should export attachment files successfully', async () => {
      const mockRecords = [
        { id: '001', name: 'file1.txt', body: Buffer.from('test content 1').toString('base64') },
        { id: '002', name: 'file2.txt', body: Buffer.from('test content 2').toString('base64') },
      ];

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, Name, Body FROM Attachment',
        outputDir: testDir,
        fileType: 'attachment',
      };

      const result = await fileExport.exportFiles(options);

      expect(result.filesExported).to.equal(2);
      expect(result.filesFailed).to.equal(0);
      expect(result.success).to.be.true;
      expect(fs.existsSync(path.join(testDir, 'file1.txt'))).to.be.true;
      expect(fs.existsSync(path.join(testDir, 'file2.txt'))).to.be.true;
    });

    it('should export ContentDocument files successfully', async () => {
      const mockRecords = [
        {
          id: '069xx000000IZ3',
          'ContentDocument.Title': 'document.pdf',
          versionData: Buffer.from('pdf content').toString('base64'),
        },
      ];

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, ContentDocument.Title, VersionData FROM ContentVersion',
        outputDir: testDir,
        fileType: 'contentdocument',
      };

      const result = await fileExport.exportFiles(options);

      expect(result.filesExported).to.equal(1);
      expect(result.success).to.be.true;
    });

    it('should handle export errors gracefully', async () => {
      const mockRecords = [
        { id: '001', name: 'file1.txt', body: '' }, // Empty content
        { id: '002', name: 'file2.txt', body: Buffer.from('valid content').toString('base64') },
      ];

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, Name, Body FROM Attachment',
        outputDir: testDir,
        fileType: 'attachment',
      };

      const result = await fileExport.exportFiles(options);

      expect(result.filesExported).to.equal(1);
      expect(result.filesFailed).to.equal(1);
      expect(result.errors.length).to.equal(1);
    });

    it('should create output directory if it does not exist', async () => {
      const newDir = path.join(testDir, 'newdir');
      const mockRecords = [{ id: '001', name: 'file1.txt', body: Buffer.from('content').toString('base64') }];

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, Name, Body FROM Attachment',
        outputDir: newDir,
        fileType: 'attachment',
      };

      const result = await fileExport.exportFiles(options);

      expect(fs.existsSync(newDir)).to.be.true;
      expect(result.filesExported).to.equal(1);
    });

    it('should handle large batches with auto-detection', async () => {
      const mockRecords = Array.from({ length: 1500 }, (_, i) => ({
        id: `00${i}`,
        name: `file${i}.txt`,
        body: Buffer.from(`content ${i}`).toString('base64'),
      }));

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, Name, Body FROM Attachment LIMIT 10000',
        outputDir: testDir,
        fileType: 'attachment',
        useBulkApi: undefined, // Auto-detect
      };

      const result = await fileExport.exportFiles(options);

      expect(result.filesExported).to.be.greaterThan(0);
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove invalid characters from filename', () => {
      const testCases = [
        { input: 'file<name>.txt', expected: 'file_name_.txt' },
        { input: 'file|name?.txt', expected: 'file_name_.txt' },
        { input: '..evil.txt', expected: '_evil.txt' },
      ];

      testCases.forEach(({ input, expected }) => {
        const sanitized = (fileExport as any).sanitizeFileName(input);
        expect(sanitized).to.equal(expected);
      });
    });

    it('should truncate long filenames to 255 characters', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const sanitized = (fileExport as any).sanitizeFileName(longName);
      expect(sanitized.length).to.equal(255);
    });
  });

  describe('validateWritePermissions', () => {
    it('should verify write permissions on directory', () => {
      expect(() => fileExport.validateWritePermissions(testDir)).to.not.throw();
    });

    it('should throw error if directory is not writable', () => {
      if (process.platform !== 'win32') {
        const readOnlyDir = path.join(testDir, 'readonly');
        fs.mkdirSync(readOnlyDir);
        fs.chmodSync(readOnlyDir, 0o444);

        expect(() => fileExport.validateWritePermissions(readOnlyDir)).to.throw();

        fs.chmodSync(readOnlyDir, 0o755);
      }
    });
  });

  describe('getFileTypeConfig', () => {
    it('should return correct config for attachment type', () => {
      const config = fileExport.getFileTypeConfig('attachment');
      expect(config.nameField).to.equal('Name');
      expect(config.contentField).to.equal('Body');
      expect(config.queryFields).to.include('Id', 'Name', 'Body');
    });

    it('should return correct config for contentdocument type', () => {
      const config = fileExport.getFileTypeConfig('contentdocument');
      expect(config.contentField).to.equal('VersionData');
      expect(config.queryFields).to.include('VersionData');
    });

    it('should return default config for unknown type', () => {
      const config = fileExport.getFileTypeConfig('unknown');
      expect(config).to.have.property('contentField');
      expect(config).to.have.property('nameField');
    });
  });

  describe('Query validation', () => {
    it('should reject invalid query for attachment type', async () => {
      (connectionStub.query as sinon.SinonStub).resolves({ records: [] });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id FROM Account', // Wrong object
        outputDir: testDir,
        fileType: 'attachment',
      };

      try {
        await fileExport.exportFiles(options);
        expect.fail('Should have thrown error');
      } catch (err) {
        expect((err as SfError).message).to.include('Query must select from Attachment');
      }
    });
  });

  describe('File content handling', () => {
    it('should decode base64 encoded content', async () => {
      const originalContent = 'Hello, World!';
      const encodedContent = Buffer.from(originalContent).toString('base64');
      const mockRecords = [{ id: '001', name: 'test.txt', body: encodedContent }];

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, Name, Body FROM Attachment',
        outputDir: testDir,
        fileType: 'attachment',
      };

      const result = await fileExport.exportFiles(options);

      expect(result.filesExported).to.equal(1);
      const fileContent = fs.readFileSync(path.join(testDir, 'test.txt'), 'utf-8');
      expect(fileContent).to.equal(originalContent);
    });

    it('should handle UTF-8 encoded content', async () => {
      const originalContent = 'こんにちは世界';
      const mockRecords = [{ id: '001', name: 'test.txt', body: originalContent }];

      (connectionStub.query as sinon.SinonStub).resolves({ records: mockRecords });

      const options: FileExportOptions = {
        soqlQuery: 'SELECT Id, Name, Body FROM Attachment',
        outputDir: testDir,
        fileType: 'attachment',
      };

      const result = await fileExport.exportFiles(options);

      expect(result.filesExported).to.equal(1);
    });
  });
});
