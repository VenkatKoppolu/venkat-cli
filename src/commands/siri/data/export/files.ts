/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { FileExport, type FileExportError } from '../../../../utilities/fileexport.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('siri', 'siri.data.export.files');

const VALID_FILE_TYPES = ['attachment', 'contentdocument', 'document'] as const;
type ValidFileType = (typeof VALID_FILE_TYPES)[number];

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
      options: [...VALID_FILE_TYPES],
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

    concurrency: Flags.integer({
      summary: messages.getMessage('flags.concurrency.summary'),
      description: messages.getMessage('flags.concurrency.description'),
      required: false,
      char: 'c',
      default: 10,
      min: 1,
      max: 50,
    }),

    'max-file-size': Flags.integer({
      summary: messages.getMessage('flags.max-file-size.summary'),
      description: messages.getMessage('flags.max-file-size.description'),
      required: false,
      default: 104_857_600, // 100 MB in bytes
      min: 1,
    }),
  };

  // FIX: static method declared before public instance method (member-ordering)
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(SiriDataExportFiles);
    const org = flags['target-org'];
    // eslint-disable-next-line sf-plugin/get-connection-with-version
    const connection = org.getConnection();

    this.spinner.start('Preparing file export...');

    try {
      // fileType validated by Flags.string({ options }) — cast is safe
      const fileType = flags.filetype as ValidFileType;
      const query = flags.query;
      const outputDir = flags['output-dir'];

      const fileExport = new FileExport(connection);

      // validateWritePermissions and ensureDirectoryExists are called
      // inside exportFiles() — no need to duplicate them here
      this.spinner.status = 'Exporting files...';

      const result = await fileExport.exportFiles({
        soqlQuery: query,
        outputDir,
        fileType,
        concurrency: flags.concurrency,
        maxFileSizeBytes: flags['max-file-size'],
      });

      this.spinner.stop('Export completed');

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2));
      } else {
        this.log('\nFile Export Summary:');
        this.log(`  Status:           ${result.success ? '✓ Success' : '⚠ Completed with errors'}`);
        this.log(`  Files Exported:   ${result.filesExported}`);
        this.log(`  Files Failed:     ${result.filesFailed}`);
        // FIX: static call — no this.formatBytes (class-methods-use-this)
        this.log(`  Total Size:       ${SiriDataExportFiles.formatBytes(result.totalSize)}`);
        this.log(`  Duration:         ${(result.exportDuration / 1000).toFixed(2)}s`);
        this.log(`  Output Directory: ${outputDir}`);

        if (result.errors.length > 0) {
          this.log('\nErrors:');
          // FIX: typed as FileExportError — no any
          result.errors.forEach((err: FileExportError) => {
            this.log(`  - [${err.recordId}] ${err.fileName}: ${err.error}`);
          });
        }
      }

      // Non-zero exit on partial failure — CI pipelines detect without parsing stdout
      if (!result.success) {
        process.exitCode = 1;
      }
    } catch (err) {
      this.spinner.stop('Export failed');
      throw err;
    }
  }
}
