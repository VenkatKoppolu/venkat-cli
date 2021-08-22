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

export default class BulkV2Query extends SfdxCommand {
    public static readonly description = messages.getMessage('queryDescription');
    public static readonly examples = messages.getMessage('queryExamples').split(os.EOL);
    protected static flagsConfig: FlagsConfig = {
        sobjecttype: flags.string({
            char: "s",
            description: messages.getMessage("sobjecttypeDescription"),
            required: true
        }),
        query: flags.string({
            char: "q",
            description: messages.getMessage("queryDescription"),
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
        outputfile: flags.string({
          char: "o",
          description: messages.getMessage("outputFileDescription"),
          required: true
        })
    };
    protected static requiresUsername = true;

    public async run(): Promise<JobInfo> {
        this.ux.startSpinner('BulkV2 Query');
        try {
            let bulkv2 = new BulkV2(this.org.getConnection(), this.ux);
            let input: BulkV2Input = { sobjecttype: this.flags.sobjecttype, operation: 'query', query: this.flags.query, lineending: this.flags.lineending, delimiter: this.flags.columndelimiter };
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
