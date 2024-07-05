import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import { BulkV2Input, JobInfo } from '../../../../types/bulkv2.js';
import { BulkV2 } from '../../../../utilities/bulkv2.js';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');

export type BulkV2InsertResult = JobInfo;

export default class BulkV2Insert extends SfCommand<BulkV2InsertResult> {
  public static readonly summary = messages.getMessage('insert.summary');
  public static readonly description = messages.getMessage('insert.description');
  public static readonly examples = messages.getMessages('insert.examples');

  public static readonly flags = {
    sobjecttype: Flags.string({
      char: 's',
      summary: messages.getMessage('flags.sobjecttype.summary'),
      description: messages.getMessage('flags.sobjecttype.description'),
      required: true,
    }),
    csvfile: Flags.string({
      char: 'f',
      summary: messages.getMessage('flags.csvfile.summary'),
      description: messages.getMessage('flags.csvfile.description'),
      required: true,
    }),
    lineending: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.lineending.summary'),
      description: messages.getMessage('flags.lineending.description'),
      required: false,
      default: 'LF',
    }),
    columndelimiter: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.columndelimiter.summary'),
      description: messages.getMessage('flags.columndelimiter.description'),
      required: false,
      default: 'COMMA',
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<BulkV2InsertResult> {
    const { flags } = await this.parse(BulkV2Insert);

    // Start the spinner
    this.spinner.start('BulkV2 Insert');

    try {/// Create the Org instance
    const org = await Org.create();

    // Retrieve the connection
    const connection = org.getConnection();
      // Instantiate BulkV2 utility
      const bulkv2 = new BulkV2(connection);

      // Define the input for BulkV2 operation
      const input: BulkV2Input = {
        sobjecttype: flags.sobjecttype,
        operation: 'insert',
        csvfile: flags.csvfile,
        lineending: flags.lineending,
        delimiter: flags.columndelimiter,
      };

      // Perform the operation
      const response: JobInfo = await bulkv2.operate(input);

      // Log the response
      this.log(messages.getMessage('info.jobDetails', [response.id, response.id]));

      // Stop the spinner
      this.spinner.stop();

      // Return the response
      return response;
    } catch (err) {
      // Stop the spinner in case of error
      this.spinner.stop();

      // Handle and log the error
      // this.log(err);
      // Rethrow the error for propagation
      throw SfError.wrap(err);
    }
  }
  /* private handleSfError(err: unknown): void {
        // Check if the error is an instance of SfdxError or CoreError
        if (err instanceof SfError || err.name === 'CoreError') {
           // const msg = getString(err, 'message') || 'Unknown error';
            this.logError(Json.stringify(err));
        } else {
            // For other types of errors, handle as needed
            this.logError('Unexpected error:'+Json.stringify(err));
        }
    }

    private logError(message: string): void {
        // Log error messages using this.log or other methods
        this.log(message);
    } */
}
