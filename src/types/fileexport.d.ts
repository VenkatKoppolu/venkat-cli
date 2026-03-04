/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/member-ordering */

export type FileType = 'attachment' | 'contentdocument' | 'document';

export interface FileExportOptions {
  soqlQuery: string;
  outputDir: string;
  fileType: FileType;
  useBulkApi?: boolean;
}

export interface FileExportResult {
  success: boolean;
  filesExported: number;
  filesFailed: number;
  totalSize: number;
  exportDuration: number;
  errors: FileExportError[];
}

export interface FileExportError {
  fileName: string;
  recordId: string;
  error: string;
  timestamp: Date;
}

export interface FileRecord {
  id: string;
  name: string;
  size?: number;
  contentType?: string;
  body?: string;
  versionData?: string;
  data?: string;
  [key: string]: unknown;
}

export interface FileTypeConfig {
  queryFields: string[];
  contentField: string;
  nameField: string;
}
