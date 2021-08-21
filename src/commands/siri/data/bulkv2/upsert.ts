import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { getString } from '@salesforce/ts-types';
import * as os from 'os';
import { JobInfo, JobRequest } from '../../../../types/bulkv2';
import { BulkV2 } from '../../../../utilities/bulkv2';



// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('siri', 'bulkv2');

export default class BulkV2Upsert extends SfdxCommand {
    public static readonly description = messages.getMessage('upsertDescription');
    public static readonly examples = messages.getMessage('upsertExamples').split(os.EOL);
    protected static flagsConfig: FlagsConfig = {
        sobjecttype: flags.string({
            char: "s",
            description: messages.getMessage("sobjecttypeDescription"),
            required: true
        }),
        externalid: flags.string({
            char: "i",
            description: messages.getMessage("externalIdDescription"),
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
        })
    };
    protected static requiresUsername = true;

    public async run(): Promise<JobInfo> {
        this.ux.startSpinner('BulkV2 Upsert...');
        try {
            let bulkv2 = new BulkV2(this.org.getConnection(), this.ux);
            let input: JobRequest = { sobjecttype: this.flags.sobjecttype, externalid: this.flags.externalid, operation: 'upsert', csvfile: this.flags.csvfile, lineending: this.flags.lineending };
            let response: JobInfo = await bulkv2.upsertData(input);
            this.ux.log(messages.getMessage('upsertInfo', [response.id, response.id]));
            this.ux.stopSpinner();
            return response;
        } catch (err) {
            const msg = getString(err, 'message');
            throw SfdxError.create('siri', 'bulkv2', 'failure', [msg]);
        }
    }
}
