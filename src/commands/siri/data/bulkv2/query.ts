import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import { BulkV2Input, JobInfo } from '../../../../types/bulkv2.js';
import { BulkV2 } from '../../../../utilities/bulkv2.js';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');
export type BulkV2QueryResult = JobInfo;

export default class BulkV2Query extends SfCommand<BulkV2QueryResult> {
 public static readonly summary = messages.getMessage('query.summary');
  public static readonly description = messages.getMessage('query.description');
  public static readonly examples = messages.getMessages('query.examples');

  public static readonly flags = {
    sobjecttype: Flags.string({
      char: 's',
      summary: messages.getMessage('flags.sobjecttype.summary'),
      description: messages.getMessage('flags.sobjecttype.description'),
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
    query: Flags.string({
      char: 'q',
      summary: messages.getMessage('flags.query.summary'),
      description: messages.getMessage('flags.query.description'),
      required: true,
    }),
    outputfile: Flags.string({
      char: 'f',
      summary: messages.getMessage('flags.outputfile.summary'),
      description: messages.getMessage('flags.outputfile.description'),
      required: false,
    }),
  };
    protected static requiresUsername = true;

    public async run(): Promise<BulkV2QueryResult> {
         const { flags } = await this.parse(BulkV2Query);

    // Start the spinner
    this.spinner.start('BulkV2 Query');
        try {
            const org = await Org.create();

    // Retrieve the connection
    const connection = org.getConnection();
            const bulkv2 = new BulkV2(connection);
            const input: BulkV2Input = { 
                csvfile: flags.outputfile, 
                sobjecttype: flags.sobjecttype, 
                operation: 'query', 
                query: flags.query, 
                lineending: flags.lineending, 
                delimiter: flags.columndelimiter 
            };
            const response: JobInfo = await bulkv2.operate(input);
            this.log(messages.getMessage('info.jobDetails', [response.id, response.id]));
           this.spinner.stop();
            return response;
        } catch (err) {
             throw SfError.wrap(err);
        }
    }
}
