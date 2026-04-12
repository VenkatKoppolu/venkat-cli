/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
import { FileExport } from '../../../../utilities/fileexport.js';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, class-methods-use-this */

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.export.files');

export default class SiriDataExportFiles extends SfCommand<void> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    filetype: Flags.string({
      summary: messages.getMessage('flags.filetype.summary'),
      description: messages.getMessage('flags.filetype.description'),
      required: true,
      char: 't',
    }),
    query: Flags.string({
      summary: messages.getMessage('flags.query.summary'),
      description: messages.getMessage('flags.query.description'),
      required: true,
      char: 'q',
    }),
    'output-dir': Flags.directory({
      summary: messages.getMessage('flags.output-dir.summary'),
      description: messages.getMessage('flags.output-dir.description'),
      required: true,
      char: 'd',
      exists: false,
    }),
    'use-bulk-api': Flags.boolean({
      summary: messages.getMessage('flags.use-bulk-api.summary'),
      description: messages.getMessage('flags.use-bulk-api.description'),
      required: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(SiriDataExportFiles);
    const org = flags['target-org'];
    // eslint-disable-next-line sf-plugin/get-connection-with-version
    const connection = org.getConnection();

    this.spinner.start('Preparing file export...');

    try {
      // Validate flags
      const fileType = String(flags.filetype) as 'attachment' | 'contentdocument' | 'document';
      const query = String(flags.query);
      const outputDir = String(flags['output-dir']);

      // Initialize file export utility
      const fileExport = new FileExport(connection);

      // Validate write permissions
      this.spinner.status = 'Validating write permissions...';
      fileExport.validateWritePermissions(outputDir);

      // Execute export
      this.spinner.status = 'Exporting files...';
      const result = await fileExport.exportFiles({
        soqlQuery: query,
        outputDir,
        fileType,
        useBulkApi: flags['use-bulk-api'] as boolean | undefined,
      });

      this.spinner.stop('Export completed');

      // Display results
      if (flags.json) {
        this.log(JSON.stringify(result, null, 2));
      } else {
        this.log('\nFile Export Summary:');
        this.log(`Files Exported: ${result.filesExported}`);
        this.log(`Files Failed: ${result.filesFailed}`);
        this.log(`Total Size: ${this.formatBytes(result.totalSize)}`);
        this.log(`Duration: ${(result.exportDuration / 1000).toFixed(2)}s`);
        this.log(`Output Directory: ${outputDir}`);

        if (result.errors.length > 0) {
          this.log('\nErrors:');
          result.errors.forEach((err: any) => {
            this.log(`  - ${err.fileName} (${err.recordId}): ${err.error}`);
          });
        }
      }
    } catch (err) {
      this.spinner.stop('Export failed');
      throw err;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

