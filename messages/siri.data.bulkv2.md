# summary

Perform bulk data operations using Salesforce Bulk API v2.

# description

Execute high-performance bulk data operations including insert, update, upsert, delete, and query operations on large datasets with progress tracking and comprehensive error handling.

# examples

- Insert records into Account object:

  <%= config.bin %> <%= command.id %> insert --sobjecttype Account --csvfile accounts.csv

- Check the status of a bulk job:

  <%= config.bin %> <%= command.id %> status --jobid 750xx0000000044AAA

# info.jobDetails
Check job %s status with the command
sfdx siri:data:bulkv2:status -i %s


# info.jobStatus
Job Status

# info.jobStatusInfo

Job %s is still in %s state.

# status.summary

Track the status of a Bulk API v2 job.

# status.description

Retrieve real-time progress and status information for a bulk job execution.

# status.examples

sf  siri data bulkv2 status -i 7505r0000xxxxxxxxx(jobid)

# insert.summary

Insert records into the org using Bulk API v2.

# insert.description

Load thousands of records efficiently into Salesforce using the Bulk API v2 with automatic chunking for large CSV files.

# insert.examples

sf siri data bulkv2 insert -s Account -f '/csv/file/path/csvfile.csv'


# update.summary

Update records in the org using Bulk API v2.

# update.description

Updates existing records in bulk using the Salesforce Bulk API v2 with progress tracking.

# update.examples

sf siri data bulkv2 update -s Account -f '/csv/file/path/csvfile.csv'


# upsert.summary

Insert or update records using Bulk API v2 with external ID.

# upsert.description

Insert or update records in bulk using the Salesforce Bulk API v2 with external ID lookups for matching.

# upsert.examples

sf siri data bulkv2 upsert -s Account -i externalId__c -f '/csv/file/path/csvfile.csv'

# query.summary

Execute SOQL queries at scale using Bulk API v2.

# query.description

Execute SOQL queries against large datasets with streaming results to CSV using the Salesforce Bulk API v2.

# query.examples

sf siri data bulkv2 query -s Account -q \"SELECT Id FROM ACCOUNT\" -f '/csv/file/path/csvfile.csv'

# results.summary

Download results from a completed Bulk API v2 job.

# results.description

Fetch and export success, failed, or unprocessed records from a completed bulk job.

# results.examples

sf siri data bulkv2 results -i 7505r0000xxxxxxxxx -t success -o /csv/output/file/path/csvfile.csv

# results.failure

Technical error occurred while fetching the results. \n %s
    

# delete.summary

Delete or hard delete records using Bulk API v2.

# delete.description

Remove records at scale using the Salesforce Bulk API v2 with support for soft delete (Recycle Bin) or hard delete.

# delete.examples

sf siri data bulkv2 delete -s Account -f /csv/file/path/csvfile.csv
sf siri data bulkv2 delete -s Account --hardelete -f /csv/file/path/csvfile.csv

# flags.targetorg.summary

The target org for the command

# flags.csvfile.summary

(required) the path to the CSV file that defines the records to upsert

# flags.csvfile.description

(required) the path to the CSV file that defines the records to upsert

# flags.sobjecttype.summary

(required) the sObject type of the records you want to upsert

# flags.sobjecttype.description

(required) the sObject type of the records you want to upsert

# flags.columndelimiter.summary

The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
BACKQUOTE—backquote character (`)
CARET—caret character (^)
COMMA—comma character (,) which is the default delimiter
PIPE—pipe character (|)
SEMICOLON—semicolon character (;)
TAB—tab character

# flags.columndelimiter.description

The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
BACKQUOTE—backquote character (`)
CARET—caret character (^)
COMMA—comma character (,) which is the default delimiter
PIPE—pipe character (|)
SEMICOLON—semicolon character (;)
TAB—tab character

# flags.lineending.summary

(optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
Valid values are:
LF—linefeed character
CRLF—carriage return character followed by a linefeed character

# flags.lineending.description

(optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
Valid values are:
LF—linefeed character
CRLF—carriage return character followed by a linefeed character

# flags.externalid.summary

(required) the column name of the external ID

# flags.externalid.description

(required) the column name of the external ID


# flags.hardelete.summary

(optional) if specified then the deleted records aren't stored in the Recycle Bin.
 permission "Bulk API Hard Delete" should be set for the user to perform hardDelete.

# flags.hardelete.description

(optional) if specified then the deleted records aren't stored in the Recycle Bin.
 permission "Bulk API Hard Delete" should be set for the user to perform hardDelete.


# flags.query.summary

(required) Specify the SOQL query

# flags.query.description

(required) Specify the SOQL query

# flags.outputfile.summary

(required) path to the csv file to which the results will be written.

# flags.outputfile.description

(required) path to the csv file to which the results will be written.

# flags.jobid.summary

(required) the job id that is operated in the org.

# flags.jobid.description

(required) the job id that is operated in the org.

# flags.type.summary

(required) specify one of success, failed and unprocessed values to get respective results from the job.

# flags.type.description

(required) specify one of success, failed and unprocessed values to get respective results from the job.


