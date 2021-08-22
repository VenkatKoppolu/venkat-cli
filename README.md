siri
====

cli plugins named after my daughter.

[![Version](https://img.shields.io/npm/v/siri.svg)](https://npmjs.org/package/siri)
[![CircleCI](https://circleci.com/gh/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/tree/master.svg?style=shield)](https://circleci.com/gh/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/venkat-cli/branch/master)
[![Codecov](https://codecov.io/gh/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli)
[![Greenkeeper](https://badges.greenkeeper.io/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/badge.svg)](https://snyk.io/test/github/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli)
[![Downloads/week](https://img.shields.io/npm/dw/siri.svg)](https://npmjs.org/package/siri)
[![License](https://img.shields.io/npm/l/siri.svg)](https://github.com/https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g siri
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
siri/0.0.0 darwin-x64 node-v14.17.3
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx siri:data:bulkv2:delete -s <string> -f <string> [-l <string>] [-d <string>] [-h] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2delete--s-string--f-string--l-string--d-string--h--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:data:bulkv2:insert -s <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2insert--s-string--f-string--l-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:data:bulkv2:query -s <string> -q <string> -o <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2query--s-string--q-string--o-string--l-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:data:bulkv2:results -i <string> -t <string> -o <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2results--i-string--t-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:data:bulkv2:status -i <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2status--i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:data:bulkv2:update -s <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2update--s-string--f-string--l-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:data:bulkv2:upsert -s <string> -i <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siridatabulkv2upsert--s-string--i-string--f-string--l-string--d-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx siri:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siriorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx siri:data:bulkv2:delete -s <string> -f <string> [-l <string>] [-d <string>] [-h] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Delete or hard delete the records using BulkV2 API.

```
Delete or hard delete the records using BulkV2 API.

USAGE
  $ sfdx siri:data:bulkv2:delete -s <string> -f <string> [-l <string>] [-d <string>] [-h] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --columndelimiter=columndelimiter
      [default: COMMA] The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
      BACKQUOTE—backquote character (`)
      CARET—caret character (^)
      COMMA—comma character (,) which is the default delimiter
      PIPE—pipe character (|)
      SEMICOLON—semicolon character (;)
      TAB—tab character

  -f, --csvfile=csvfile
      (required) (required) the path to the CSV file that defines the records to upsert

  -h, --hardelete
      (optional) if specified then the deleted records aren't stored in the Recycle Bin. 
        permission “Bulk API Hard Delete” should be set for the user to perform hardDelete.

  -l, --lineending=lineending
      [default: LF] (optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
      Valid values are:
      LF—linefeed character
      CRLF—carriage return character followed by a linefeed character

  -s, --sobjecttype=sobjecttype
      (required) (required) the sObject type of the records you want to upsert

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLES
  sfdx siri:data:bulkv2:delete -u me@my.org -s Account -f /csv/file/path/csvfile.csv
  sfdx siri:data:bulkv2:delete -u me@my.org -s Account --hardelete -f /csv/file/path/csvfile.csv
```

_See code: [src/commands/siri/data/bulkv2/delete.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/delete.ts)_

## `sfdx siri:data:bulkv2:insert -s <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Inserts records into the org using BulkV2 API.

```
Inserts records into the org using BulkV2 API.

USAGE
  $ sfdx siri:data:bulkv2:insert -s <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --columndelimiter=columndelimiter
      [default: COMMA] The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
      BACKQUOTE—backquote character (`)
      CARET—caret character (^)
      COMMA—comma character (,) which is the default delimiter
      PIPE—pipe character (|)
      SEMICOLON—semicolon character (;)
      TAB—tab character

  -f, --csvfile=csvfile
      (required) (required) the path to the CSV file that defines the records to upsert

  -l, --lineending=lineending
      [default: LF] (optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
      Valid values are:
      LF—linefeed character
      CRLF—carriage return character followed by a linefeed character

  -s, --sobjecttype=sobjecttype
      (required) (required) the sObject type of the records you want to upsert

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sfdx siri:data:bulkv2:insert -u me@my.org -s Account -f /csv/file/path/csvfile.csv
```

_See code: [src/commands/siri/data/bulkv2/insert.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/insert.ts)_

## `sfdx siri:data:bulkv2:query -s <string> -q <string> -o <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Executes the query against the data in your default scratch org using BulkV2 API.

```
Executes the query against the data in your default scratch org using BulkV2 API.

USAGE
  $ sfdx siri:data:bulkv2:query -s <string> -q <string> -o <string> [-l <string>] [-d <string>] [-u <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --columndelimiter=columndelimiter
      [default: COMMA] The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
      BACKQUOTE—backquote character (`)
      CARET—caret character (^)
      COMMA—comma character (,) which is the default delimiter
      PIPE—pipe character (|)
      SEMICOLON—semicolon character (;)
      TAB—tab character

  -l, --lineending=lineending
      [default: LF] (optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
      Valid values are:
      LF—linefeed character
      CRLF—carriage return character followed by a linefeed character

  -o, --outputfile=outputfile
      (required) (required) path to the csv file to which the results will be written.

  -q, --query=query
      (required) Executes the query against the data in your default scratch org using BulkV2 API.

  -s, --sobjecttype=sobjecttype
      (required) (required) the sObject type of the records you want to upsert

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sfdx siri:data:bulkv2:query -u me@my.org -s Account -q "SELECT Id FROM ACCOUNT" -o /csv/file/path/csvfile.csv
```

_See code: [src/commands/siri/data/bulkv2/query.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/query.ts)_

## `sfdx siri:data:bulkv2:results -i <string> -t <string> -o <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

fetch the results for a specific BulkV2 job after execution is completed.

```
fetch the results for a specific BulkV2 job after execution is completed.

USAGE
  $ sfdx siri:data:bulkv2:results -i <string> -t <string> -o <string> [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --jobid=jobid                                                                 (required) (required) the job id
                                                                                    that is operated in the org.

  -o, --outputfile=outputfile                                                       (required) (required) path to the
                                                                                    csv file to which the results will
                                                                                    be written.

  -t, --type=type                                                                   (required) (required) specify one of
                                                                                    success, failed and unprocessed
                                                                                    values to get respective results
                                                                                    from the job.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sfdx siri:data:bulkv2:results -u me@my.org -i 7505r0000xxxxxxxxx -t success -o /csv/output/file/path/csvfile.csv
```

_See code: [src/commands/siri/data/bulkv2/results.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/results.ts)_

## `sfdx siri:data:bulkv2:status -i <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

get the status of the BulkV2 job.

```
get the status of the BulkV2 job.

USAGE
  $ sfdx siri:data:bulkv2:status -i <string> [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --jobid=jobid                                                                 (required) (required) the job id
                                                                                    that is operated in the org.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sfdx siri:data:bulkv2:status -u me@my.org  -i 7505r0000xxxxxxxxx(jobid)
```

_See code: [src/commands/siri/data/bulkv2/status.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/status.ts)_

## `sfdx siri:data:bulkv2:update -s <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Updates records into the org using BulkV2 API.

```
Updates records into the org using BulkV2 API.

USAGE
  $ sfdx siri:data:bulkv2:update -s <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --columndelimiter=columndelimiter
      [default: COMMA] The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
      BACKQUOTE—backquote character (`)
      CARET—caret character (^)
      COMMA—comma character (,) which is the default delimiter
      PIPE—pipe character (|)
      SEMICOLON—semicolon character (;)
      TAB—tab character

  -f, --csvfile=csvfile
      (required) (required) the path to the CSV file that defines the records to upsert

  -l, --lineending=lineending
      [default: LF] (optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
      Valid values are:
      LF—linefeed character
      CRLF—carriage return character followed by a linefeed character

  -s, --sobjecttype=sobjecttype
      (required) (required) the sObject type of the records you want to upsert

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sfdx siri:data:bulkv2:update -u me@my.org -s Account -f /csv/file/path/csvfile.csv
```

_See code: [src/commands/siri/data/bulkv2/update.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/update.ts)_

## `sfdx siri:data:bulkv2:upsert -s <string> -i <string> -f <string> [-l <string>] [-d <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

upsert records from csv file to salesforce using BulkV2 API.

```
upsert records from csv file to salesforce using BulkV2 API.

USAGE
  $ sfdx siri:data:bulkv2:upsert -s <string> -i <string> -f <string> [-l <string>] [-d <string>] [-u <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --columndelimiter=columndelimiter
      [default: COMMA] The column delimiter used for CSV job data. The default value is COMMA. Valid values are:
      BACKQUOTE—backquote character (`)
      CARET—caret character (^)
      COMMA—comma character (,) which is the default delimiter
      PIPE—pipe character (|)
      SEMICOLON—semicolon character (;)
      TAB—tab character

  -f, --csvfile=csvfile
      (required) (required) the path to the CSV file that defines the records to upsert

  -i, --externalid=externalid
      (required) (required) the column name of the external ID

  -l, --lineending=lineending
      [default: LF] (optional) The line ending used for CSV job data, marking the end of a data row. The default is LF. 
      Valid values are:
      LF—linefeed character
      CRLF—carriage return character followed by a linefeed character

  -s, --sobjecttype=sobjecttype
      (required) (required) the sObject type of the records you want to upsert

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sfdx siri:data:bulkv2:upsert -u me@my.org -s Account -i externalId__c -f /csv/file/path/csvfile.csv
```

_See code: [src/commands/siri/data/bulkv2/upsert.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/data/bulkv2/upsert.ts)_

## `sfdx siri:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
print a greeting and your org IDs

USAGE
  $ sfdx siri:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --force                                                                       example boolean flag
  -n, --name=name                                                                   name to print

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx siri:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx siri:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src/commands/siri/org.ts](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/src/commands/siri/org.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `siri:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx siri:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run siri:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
