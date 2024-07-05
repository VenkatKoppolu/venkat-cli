# summary

Say hello.

# description

Say hello either to the world or someone you know.

# examples

- Say hello to the world:

  <%= config.bin %> <%= command.id %>

- Say hello to someone you know:

  <%= config.bin %> <%= command.id %> --name Astro

# info.jobDetails
Check job %s status with the command
sfdx siri:data:bulkv2:status -i %s


# info.jobStatus
Job Status

# info.jobStatusInfo

Job %s is still in %s state.

# status.summary

get the status of the BulkV2 job.

# status.description

get the status of the BulkV2 job.

# status.examples

sf  siri data bulkv2 status -i 7505r0000xxxxxxxxx(jobid)

# insert.summary

Inserts records into the org using BulkV2 API.

# insert.description

Inserts records into the org using BulkV2 API.

# insert.examples

sf siri data bulkv2 insert -s Account -f '/csv/file/path/csvfile.csv'


# update.summary

Updates records into the org using BulkV2 API.

# update.description

Updates records into the org using BulkV2 API.

# update.examples

sf siri data bulkv2 update -s Account -f '/csv/file/path/csvfile.csv'


# upsert.summary

Upsert records from csv file to salesforce using BulkV2 API.

# upsert.description

Upsert records from csv file to salesforce using BulkV2 API.

# upsert.examples

sf siri data bulkv2 upsert -s Account -i externalId__c -f '/csv/file/path/csvfile.csv'

# query.summary

Executes the query against the data in your default (scratch) org using BulkV2 API.

# query.description

Executes the query against the data in your default (scratch) org using BulkV2 API.

# query.examples

sf siri data bulkv2 query -s Account -q \"SELECT Id FROM ACCOUNT\" -f '/csv/file/path/csvfile.csv'

# results.summary

fetch the results for a specific BulkV2 job after execution is completed.

# results.description

fetch the results for a specific BulkV2 job after execution is completed.

# results.examples

sf siri data bulkv2 results -i 7505r0000xxxxxxxxx -t success -o /csv/output/file/path/csvfile.csv

# results.failure

Technical error occurred while fetching the results. \n %s
    

# delete.summary

Delete or hard delete the records using BulkV2 API.

# delete.description

Delete or hard delete the records using BulkV2 API.

# delete.examples

sf siri data bulkv2 delete -s Account -f /csv/file/path/csvfile.csv
sf siri data bulkv2 delete -s Account --hardelete -f /csv/file/path/csvfile.csv

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


