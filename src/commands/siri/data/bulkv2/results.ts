import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import { BulkV2 } from '../../../../utilities/bulkv2.js';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');

export default class BulkV2Results extends SfCommand<void> {
  public static readonly summary = messages.getMessage('results.summary');
  public static readonly description = messages.getMessage('results.description');
  public static readonly examples = messages.getMessages('results.examples');

  public static readonly flags = {
    jobid: Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.jobid.summary'),
      description: messages.getMessage('flags.jobid.description'),
      required: true,
    }),
    type: Flags.string({
      char: 't',
      summary: messages.getMessage('flags.type.summary'),
      description: messages.getMessage('flags.type.description'),
      required: false,
      default: 'LF',
    }),
    outputfile: Flags.string({
      char: 'f',
      summary: messages.getMessage('flags.outputfile.summary'),
      description: messages.getMessage('flags.outputfile.description'),
      required: true,
    }),
  };
  
  protected static requiresUsername = true;

  public async run(): Promise<void> {
     const { flags } = await this.parse(BulkV2Results);
     this.spinner.start('Fetching Results');
        try {
            const org = await Org.create();

    // Retrieve the connection
    const connection = org.getConnection();
      const bulkv2 = new BulkV2(connection);
      const result: boolean = await bulkv2.results(flags.jobid,flags.type.toUpperCase(),flags.outputfile);
      if(result){
        this.log(`results are written to file ${flags.outputfile}`);
      }
      this.spinner.stop();
    } catch (err) {
       throw SfError.wrap(err);
    }
  }
}
