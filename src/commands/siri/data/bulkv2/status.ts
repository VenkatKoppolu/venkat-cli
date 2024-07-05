import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org, SfError } from '@salesforce/core';
import { BulkV2 } from '../../../../utilities/bulkv2.js';
import { JobInfo } from '../../../../types/bulkv2.js';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

// Load the specific messages for this file.
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');
export type BulkV2StatusResult = JobInfo;

export default class BulkV2Status extends SfCommand<BulkV2StatusResult> {
 public static readonly summary = messages.getMessage('status.summary');
  public static readonly description = messages.getMessage('status.description');
  public static readonly examples = messages.getMessages('status.examples');
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
  };
  
  protected static requiresUsername = true;

  public async run(): Promise<BulkV2StatusResult> {
    const { flags } = await this.parse(BulkV2Status);
    this.spinner.start('Getting Status');
    try {
      const org = await Org.create();

    // Retrieve the connection
    const connection = org.getConnection();
      const bulkv2 = new BulkV2(connection);
      const jobsummary: JobInfo = await bulkv2.status(flags.jobid,flags.type?.toUpperCase());
      this.statusSummary(jobsummary);
      this.spinner.stop();
      return jobsummary;
    } catch (err) {
       throw SfError.wrap(err);
    }
  }

  private statusSummary(summary: JobInfo): JobInfo {
    this.log('');
    const formatOutput: string[] = [];
    for (const field in summary) {
      if (Object.prototype.hasOwnProperty.call(summary, field)) {
        formatOutput.push(field);
      }
    }
    formatOutput.splice(0, 1);
    if ('$' in summary) {
    delete summary['$'];
    }
    this.styledHeader(messages.getMessage('info.jobStatus'));

    this.styledObject([JSON.stringify(summary), formatOutput]);

    return summary;

    /* if (results) {
      const errorMessages: string[] = [];
      results.forEach((result: BatchResultInfo): void => {
        if (result.errors) {
          result.errors.forEach((errMsg) => {
            errorMessages.push(errMsg);
          });
        }
      });
      if (errorMessages.length > 0) {
        this.ux.styledHeader(messages.getMessage('BulkError'));
        errorMessages.forEach((errorMessage) => {
          this.ux.log(errorMessage);
        });
      }
    } */


  }
}
