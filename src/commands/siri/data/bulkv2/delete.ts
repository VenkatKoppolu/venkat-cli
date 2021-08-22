import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { getString } from '@salesforce/ts-types';
import * as os from 'os';
import { BulkV2Input, JobInfo } from '../../../../types/bulkv2';
import { BulkV2 } from '../../../../utilities/bulkv2';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('siri', 'bulkv2');

export default class BulkV2Delete extends SfdxCommand {
    public static readonly description = messages.getMessage('deleteDescription');
    public static readonly examples = messages.getMessage('deleteExamples').split(os.EOL);
    protected static flagsConfig: FlagsConfig = {
        sobjecttype: flags.string({
            char: "s",
            description: messages.getMessage("sobjecttypeDescription"),
            required: true
        }),
        csvfile: flags.string({
            char: "f",
            description: messages.getMessage("csvfileDescription"),
            required: true
        }),
        lineending: flags.string({
            char: "l",
            description: messages.getMessage("lineendingDescription"),
            required: false,
            default: "LF"
        }),
        columndelimiter: flags.string({
            char: "d",
            description: messages.getMessage("columndelimiterDescription"),
            required: false,
            default: "COMMA"
        }),
        hardelete: flags.boolean({
            char: "h",
            description: messages.getMessage("harddeleteDescription"),
            required: false,
            default: false
        })
    };
    protected static requiresUsername = true;

    public async run(): Promise<JobInfo> {
        this.ux.startSpinner('BulkV2 Delete');
        try {
            let bulkv2 = new BulkV2(this.org.getConnection(), this.ux);
            let input: BulkV2Input = { sobjecttype: this.flags.sobjecttype, operation: (this.flags.hardelete)?'hardDelete':'delete', csvfile: this.flags.csvfile, lineending: this.flags.lineending, delimiter: this.flags.columndelimiter };
            let response: JobInfo = await bulkv2.operate(input);
            this.ux.log(messages.getMessage('jobDetails', [response.id, response.id]));
            this.ux.stopSpinner();
            return response;
        } catch (err) {
            const msg = getString(err, 'message');
            throw SfdxError.create('siri', 'bulkv2', 'failure', [msg]);
        }
    }
}
