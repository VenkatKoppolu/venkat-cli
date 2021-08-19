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
siri/0.0.0 darwin-x64 node-v16.0.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx siri:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-siriorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

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

_See code: [lib/commands/siri/org.js](https://github.com/VenkatKoppolu/venkat-cli.git/https://github.com/VenkatKoppolu/venkat-cli/blob/v0.0.0/lib/commands/siri/org.js)_
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
