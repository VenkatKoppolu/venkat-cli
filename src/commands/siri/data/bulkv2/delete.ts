import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import { BulkV2Input, JobInfo } from '../../../../types/bulkv2.js';
import { BulkV2 } from '../../../../utilities/bulkv2.js';


// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');
export type BulkV2DeleteResult = JobInfo;

export default class BulkV2Delete extends SfCommand<BulkV2DeleteResult[]> {
  public static readonly summary = messages.getMessage('delete.summary');
  public static readonly description = messages.getMessage('delete.description');
  public static readonly examples = messages.getMessages('delete.examples');

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
     hardelete: Flags.boolean({
            char: 'x',
            summary: messages.getMessage('flags.hardelete.summary'),
            description: messages.getMessage('flags.hardelete.description'),
            required: false,
            default: false
        })
  };
   
    protected static requiresUsername = true;

    public async run(): Promise<BulkV2DeleteResult[]> {
         const { flags } = await this.parse(BulkV2Delete);

    // Start the spinner
    this.spinner.start('BulkV2 Delete');
        const responses: JobInfo[] = [];
        try {
            const org = await Org.create();
            // Retrieve the connection
            const connection = org.getConnection();
            const bulkv2 = new BulkV2(connection);
            const files: string[] = bulkv2.checkFileSizeAndAct(flags.csvfile);
            /* eslint-disable no-await-in-loop */
            for (const file of files) {
                const input: BulkV2Input = { 
                    sobjecttype: flags.sobjecttype, 
                    operation: (flags.hardelete) ? 'hardDelete' : 'delete', 
                    csvfile: file, 
                    lineending: flags.lineending, 
                    delimiter: flags.columndelimiter 
                };
                 // Perform the operation
                 const response: JobInfo = await bulkv2.operate(input);
                 responses.push(response);
                 this.log(messages.getMessage('info.jobDetails', [response.id, response.id]));
            }
            /* eslint-disable no-await-in-loop */
        } catch (err) {
           throw SfError.wrap(err);
        }finally{
            this.spinner.stop();
            // eslint-disable-next-line no-unsafe-finally
            return responses;
        }
    }
}
