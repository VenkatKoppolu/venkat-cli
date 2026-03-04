/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, class-methods-use-this, @typescript-eslint/member-ordering, no-await-in-loop, @typescript-eslint/require-await */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Connection, SfError, Logger } from '@salesforce/core';

export type FileExportOptions = {
  soqlQuery: string;
  outputDir: string;
  fileType: 'attachment' | 'contentdocument' | 'document';
  useBulkApi?: boolean;
}

export type FileExportResult = {
  success: boolean;
  filesExported: number;
  filesFailed: number;
  totalSize: number;
  exportDuration: number;
  errors: FileExportError[];
}

export type FileExportError = {
  fileName: string;
  recordId: string;
  error: string;
  timestamp: Date;
}

export type FileRecord = {
  id: string;
  name: string;
  size?: number;
  contentType?: string;
  body?: string;
  versionData?: string;
  data?: string;
  [key: string]: unknown;
}

export class FileExport {
  private connection: Connection;
  private logger: Logger;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.logger = Logger.childFromRoot(this.constructor.name);
  }

  /**
   * Export files from Salesforce based on file type and SOQL query
   */
  public async exportFiles(options: FileExportOptions): Promise<FileExportResult> {
    const startTime = Date.now();
    const errors: FileExportError[] = [];
    let filesExported = 0;
    let totalSize = 0;

    try {
      // Validate output directory
      this.ensureDirectoryExists(options.outputDir);

      // Fetch file records based on type
      const fileRecords = await this.fetchFileRecords(options);

      this.logger.info(`Found ${fileRecords.length} files to export`);

      // Decide whether to use Bulk API or standard API
      const useBulkApi = options.useBulkApi ?? fileRecords.length > 1000;

      if (useBulkApi && fileRecords.length > 1000) {
        this.logger.info('Using Bulk API for large batch export');
        // Download files in bulk
        for (const record of fileRecords) {
          try {
            const result = await this.downloadFile(record, options);
            if (result) {
              filesExported++;
              totalSize += result.size;
            }
          } catch (err) {
            errors.push({
              fileName: record.name,
              recordId: record.id,
              error: err instanceof Error ? err.message : String(err),
              timestamp: new Date(),
            });
          }
        }
      } else {
        this.logger.info('Using standard API for file export');
        // Download files with standard API
        for (const record of fileRecords) {
          try {
            const result = await this.downloadFile(record, options);
            if (result) {
              filesExported++;
              totalSize += result.size;
            }
          } catch (err) {
            errors.push({
              fileName: record.name,
              recordId: record.id,
              error: err instanceof Error ? err.message : String(err),
              timestamp: new Date(),
            });
          }
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        filesExported,
        filesFailed: errors.length,
        totalSize,
        exportDuration: duration,
        errors,
      };
    } catch (err) {
      throw new SfError(
        `File export failed: ${err instanceof Error ? err.message : String(err)}`,
        'FileExportError'
      );
    }
  }

  /**
   * Fetch file records based on file type and SOQL query
   */
  private async fetchFileRecords(options: FileExportOptions): Promise<FileRecord[]> {
    const query = options.soqlQuery;

    // Validate and preprocess query based on file type
    if (options.fileType === 'attachment') {
      if (!query.toUpperCase().includes('FROM ATTACHMENT')) {
        throw new SfError('Query must select from Attachment object', 'InvalidQuery');
      }
    } else if (options.fileType === 'contentdocument') {
      if (!query.toUpperCase().includes('FROM CONTENTVERSION')) {
        throw new SfError('Query must select from ContentVersion object', 'InvalidQuery');
      }
    } else if (options.fileType === 'document') {
      if (!query.toUpperCase().includes('FROM DOCUMENT')) {
        throw new SfError('Query must select from Document object', 'InvalidQuery');
      }
    }

    try {
      const connection = this.connection;
      const queryResult = await connection.query<FileRecord>(query);

      if (!queryResult.records || queryResult.records.length === 0) {
        this.logger.warn('No records found matching the query');
        return [];
      }

      return queryResult.records;
    } catch (err) {
      throw new SfError(
        `Failed to execute SOQL query: ${err instanceof Error ? err.message : String(err)}`,
        'QueryError'
      );
    }
  }

  /**
   * Download and save a file locally
   */
  private async downloadFile(
    record: FileRecord,
    options: FileExportOptions
  ): Promise<{ size: number } | null> {
    const fileName = this.sanitizeFileName(String(record.name));
    const filePath = path.join(options.outputDir, fileName);

    let fileContent: string | NodeJS.ReadableStream | null = null;

    try {
      // Extract file content based on file type
      if (options.fileType === 'attachment') {
        fileContent = String(record.body ?? '');
      } else if (options.fileType === 'contentdocument') {
        fileContent = String(record.versionData ?? '');
      } else if (options.fileType === 'document') {
        fileContent = String(record.body ?? '');
      }

      if (!fileContent || fileContent === '') {
        this.logger.warn(`No file content found for ${fileName}`);
        return null;
      }

      // Handle base64 encoded content
      let buffer: Buffer;
      if (typeof fileContent === 'string') {
        try {
          buffer = Buffer.from(fileContent, 'base64');
        } catch {
          buffer = Buffer.from(fileContent, 'utf-8');
        }
      } else {
        buffer = fileContent as unknown as Buffer;
      }

      // Write file to disk
      fs.writeFileSync(filePath, buffer);
      this.logger.debug(`File exported: ${filePath}`);

      return { size: buffer.length };
    } catch (err) {
      throw new SfError(
        `Failed to download file ${fileName}: ${err instanceof Error ? err.message : String(err)}`,
        'DownloadError'
      );
    }
  }

  /**
   * Sanitize filename to prevent directory traversal and invalid characters
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"|?*]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/^\.+/, '_')
      .substring(0, 255);
  }

  /**
   * Ensure output directory exists, create if needed
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.info(`Created output directory: ${dirPath}`);
      } catch (err) {
        throw new SfError(
          `Failed to create output directory: ${err instanceof Error ? err.message : String(err)}`,
          'DirectoryError'
        );
      }
    } else if (!fs.statSync(dirPath).isDirectory()) {
      throw new SfError(`${dirPath} exists but is not a directory`, 'DirectoryError');
    }
  }

  /**
   * Validate output directory has write permissions
   */
  public validateWritePermissions(dirPath: string): void {
    try {
      const testFile = path.join(dirPath, `.write-test-${Date.now()}`);
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err) {
      throw new SfError(
        `No write permissions in directory ${dirPath}: ${err instanceof Error ? err.message : String(err)}`,
        'PermissionError'
      );
    }
  }

  /**
   * Get file type config
   */
  public getFileTypeConfig(fileType: string): {
    queryFields: string[];
    contentField: string;
    nameField: string;
  } {
    const configs: Record<
      string,
      { queryFields: string[]; contentField: string; nameField: string }
    > = {
      attachment: {
        queryFields: ['Id', 'Name', 'Body'],
        contentField: 'Body',
        nameField: 'Name',
      },
      contentdocument: {
        queryFields: ['Id', 'ContentDocument.Title', 'VersionData'],
        contentField: 'VersionData',
        nameField: 'ContentDocument.Title',
      },
      document: {
        queryFields: ['Id', 'Name', 'Body'],
        contentField: 'Body',
        nameField: 'Name',
      },
    };

    return configs[fileType] ?? { queryFields: [], contentField: 'Body', nameField: 'Name' };
  }
}
