import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import { BulkV2 } from '../../../../utilities/bulkv2.js';
import { BulkV2Input, JobInfo } from '../../../../types/bulkv2.js';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');
export type BulkV2UpsertResult = JobInfo;

export default class BulkV2Upsert extends SfCommand<BulkV2UpsertResult> {
      public static readonly summary = messages.getMessage('upsert.summary');
  public static readonly description = messages.getMessage('upsert.description');
  public static readonly examples = messages.getMessages('upsert.examples');
    
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
     externalid: Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.externalid.summary'),
      description: messages.getMessage('flags.externalid.description'),
      required: true,
    }),
  };
    protected static requiresUsername = true;

    public async run(): Promise<BulkV2UpsertResult> {
         const { flags } = await this.parse(BulkV2Upsert);
        this.spinner.start('BulkV2 Upsert');
        try {
             const org = await Org.create();

    // Retrieve the connection
    const connection = org.getConnection();
      // Instantiate BulkV2 utility
      const bulkv2 = new BulkV2(connection);
            const input: BulkV2Input = { sobjecttype: flags.sobjecttype, externalid: flags.externalid, operation: 'upsert', csvfile: flags.csvfile, lineending: flags.lineending, delimiter: flags.columndelimiter };
            const response: JobInfo = await bulkv2.operate(input);
            this.log(messages.getMessage('info.jobDetails', [response.id, response.id]));
            this.spinner.stop();
            return response;
        } catch (err) {
            throw SfError.wrap(err);
        }
    }
}
