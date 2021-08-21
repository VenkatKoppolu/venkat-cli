import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { getString } from '@salesforce/ts-types';
import * as os from 'os';
import { JobInfo } from '../../../../types/bulkv2';
import { BulkV2 } from '../../../../utilities/bulkv2';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('siri', 'bulkv2');

export default class BulkV2Status extends SfdxCommand {
  public static readonly description = messages.getMessage('statusDescription');
  public static readonly examples = messages.getMessage('statusExamples').split(os.EOL);
  protected static flagsConfig: FlagsConfig = {
    jobid: flags.string({
      char: "i",
      description: messages.getMessage("jobIdDescription"),
      required: true
    })
  };
  protected static requiresUsername = true;

  public async run(): Promise<JobInfo> {
    this.ux.startSpinner('Getting Status');
    try {
      let bulkv2 = new BulkV2(this.org.getConnection(), this.ux);
      let jobsummary: JobInfo = await bulkv2.getJob(this.flags.jobid);
      bulkv2.bulkStatus(jobsummary);
      this.ux.stopSpinner();
      return jobsummary;
    } catch (err) {
      const msg = getString(err, 'message');
      throw SfdxError.create('siri', 'bulkv2', 'failure', [msg]);
    }
  }
}
