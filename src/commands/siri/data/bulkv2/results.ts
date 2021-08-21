import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { getString } from '@salesforce/ts-types';
import * as os from 'os';
import { BulkV2 } from '../../../../utilities/bulkv2';


Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('siri', 'bulkv2');

export default class BulkV2Results extends SfdxCommand {
  public static readonly description = messages.getMessage('resultsDescription');
  public static readonly examples = messages.getMessage('resultsExamples').split(os.EOL);
  protected static flagsConfig: FlagsConfig = {
    jobid: flags.string({
      char: "i",
      description: messages.getMessage("jobIdDescription"),
      required: true
    }),
    type: flags.string({
      char: "t",
      description: messages.getMessage("typeDescription"),
      required: true
    }),
    outputfile: flags.string({
      char: "o",
      description: messages.getMessage("outputFileDescription"),
      required: true
    }),
  };
  protected static requiresUsername = true;

  public async run(): Promise<void> {
    this.ux.startSpinner('Fetching results');
    try {
      let bulkv2 = new BulkV2(this.org.getConnection(), this.ux);
      let result: boolean = await bulkv2.getSuccessfullResults(this.flags.jobid,this.flags.type.toUpperCase(),this.flags.outputfile);
      if(result){
        this.ux.log(`results are written to file ${this.flags.outputfile}`);
      }
      this.ux.stopSpinner();
    } catch (err) {
      const msg = getString(err, 'message');
      throw SfdxError.create('siri', 'bulkv2', 'resultsFailure', [msg]);
    }
  }
}
