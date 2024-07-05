/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as fs from 'node:fs';
import * as util from 'node:util';
import { resolve } from 'node:path';
import { Connection, Logger, Messages, SfError } from '@salesforce/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BulkV2Input, JobInfo } from '../types/bulkv2.js';
import { Common } from './common.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('siri', 'siri.data.bulkv2');

const logger = (await Logger.child('Org')).getRawLogger();

enum ENDPOINT {
  QUERY = '%s/services/data/v%s/jobs/query',
  QUERY_STATUS = '%s/services/data/v%s/jobs/query/%s',
  QUERY_RESULT = '%s/services/data/v%s/jobs/query/%s/results',

  CREATE = '%s/services/data/v%s/jobs/ingest',
  UPLOAD = '%s/services/data/v%s/jobs/ingest/%s/batches',
  STATUS = '%s/services/data/v%s/jobs/ingest/%s',
  // CLOSE = '%s/services/data/v%s/jobs/ingest/%s',
  // ABORT = '%s/services/data/v%s/jobs/ingest/%s',
  // DELETE = '%s/services/data/v%s/jobs/ingest/%s',
  FAILED = '%s/services/data/v%s/jobs/ingest/%s/failedResults',
  UNPROCESSED = '%s/services/data/v%s/jobs/ingest/%s/unprocessedrecords',
  SUCCESS = '%s/services/data/v%s/jobs/ingest/%s/successfulResults',
}

export class BulkV2 {
  private conn: Connection;
  private query: boolean = false;

  public constructor(conn: Connection) {
    this.conn = conn;
  }

  public checkFileSizeAndAct(filename: string): string[] {
    const files: string[] = [];
    const size = this.getFilesizeInMegaBytes(filename);
    if (size < 20) {
      files.push(filename);
      return files;
    }

    const numberOfTempFiles = Math.ceil(size / 20);
    const linesArray = fs.readFileSync(resolve(process.cwd(), filename), { encoding: 'utf8' }).toString().split('\n');
    const numberOfLinesInSingleFile = Math.ceil(linesArray.length / numberOfTempFiles);
    
    const result: string[][] = linesArray.reduce((resultArray: string[][], item: string, index: number) => {
      const chunkIndex = Math.floor(index / numberOfLinesInSingleFile);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, []);

    for (let i = 0; i < result.length; i++) {
      const tempFilename = `temp${i}.csv`;
      files.push(tempFilename);
      fs.writeFileSync(tempFilename, ((i === 0) ? '' : '"Id"\n') + result[i].join('\n'), { encoding: 'utf8' });
    }

    return files;
  }

  public async operate(input: BulkV2Input): Promise<JobInfo> {
    if (input.operation === 'query') {
      this.query = true;
      let job: JobInfo = await this.createJob(input);
      job = await this.status(job.id, 'QUERY_STATUS');
      if (job.state === 'JobComplete' && input.csvfile) {
        await this.results(job.id, 'QUERY_RESULT', input.csvfile);
      } else {
        logger.info(messages.getMessage('info.jobStatusInfo', [job.id, job.state]));
      }
      return job;
    } else {
      let job: JobInfo = await this.createJob(input);
      job = await this.uploadJob(job, input.csvfile);
      job = await this.patchJob(job);
      job = await this.status(job.id, '');
      return job;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async moreResults(endpoint: string, locator: string, file: string): Promise<any> {
    try {
      const config: AxiosRequestConfig = this.generateConfig('text/csv');
      config.responseType = 'stream';
      const response = await axios.get(endpoint + '?locator=' + locator, config);
      await this.fastFileWrite(file, response.data).then().catch();
      return response;
    } catch (err) {
      return err;
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-explicit-any
  public async fastFileWrite(file: string, data: any): Promise<void> {
    const writeStream = fs.createWriteStream(resolve(Common.cwd, file), { flags: 'w' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await data.pipe(writeStream);
    writeStream.on('close', () => {
      // console.log(file + 'write complete.');
    });
  }
  // eslint-disable-next-line class-methods-use-this
  public generateRequestBody(input: BulkV2Input): string {
    return JSON.stringify(
      input.operation === 'upsert'
        ? {
            object: input.sobjecttype,
            externalIdFieldName: input.externalid,
            operation: input.operation,
            lineEnding: input.lineending,
            columnDelimiter: input.delimiter,
          }
        : input.operation === 'query'
        ? {
            operation: 'query',
            query: input.query,
            contentType: 'CSV',
            columnDelimiter: input.delimiter,
            lineEnding: input.lineending,
          }
        : {
            object: input.sobjecttype,
            operation: input.operation,
            lineEnding: input.lineending,
            columnDelimiter: input.delimiter,
          }
    );
  }

  public async results(jobid: string, type: string, file: string): Promise<boolean> {
    this.query = type.includes('QUERY');
    const job: JobInfo = await this.status(jobid, this.query ? 'QUERY_STATUS' : '');
    if (!(job.state === 'JobComplete' || job.state === 'Failed')) {
      messages.getMessage('info.jobStatusInfo', [job.id, job.state]);
      return false;
    }

    const endpoint: string = this.generateEndpoint(type, jobid);
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    config.responseType = 'stream';
    // eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-misused-promises
    return axios.get(endpoint, config).then(
      (response) =>
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
        new Promise(async (resolved, rejected) => {
          try {
            await this.fastFileWrite(file, response.data).then().catch();
            let locator: string = response.headers['sforce-locator'];
            const filename = file.substring(0, file.length - 4);
            let i = 0;
            while (locator !== '') {
              i++;
              // eslint-disable-next-line no-param-reassign
              file = filename + i + '.csv';
              // eslint-disable-next-line no-await-in-loop
              const res = await this.moreResults(endpoint, locator, file);
              if ('headers' in res && 'sforce-locator' in res.headers) {
                locator = res.headers['sforce-locator'];
              } else {
                locator = '';
              }
            }
            resolved(true);
          } catch (err) {
            rejected(err);
          }
        })
    );
  }

  public async status(jobid: string, type: string): Promise<JobInfo> {
    this.query = type.includes('QUERY');
    const endpoint: string = this.generateEndpoint(this.query ? 'QUERY_STATUS' : 'STATUS', jobid);
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    const response: AxiosResponse = await axios.get(endpoint, config);
    if (response?.status !== 200) {
      response.data.errorMessage = response?.statusText + response.data.errorMessage;
    }
    return response.data;
  }

  private async patchJob(job: JobInfo): Promise<JobInfo> {
    const data: string = JSON.stringify({ state: 'UploadComplete' });
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    const endpoint: string = this.generateEndpoint('STATUS', job.id);
    const response: AxiosResponse = await axios.patch(endpoint, data, config);
    job = response.data;
    if (response.status !== 200) {
      job.errorMessage = response.statusText;
    }
    return job;
  }

  private async createJob(input: BulkV2Input): Promise<JobInfo> {
    const data: string = this.generateRequestBody(input);
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    const endpoint: string = this.generateEndpoint(this.query ? 'QUERY' : 'CREATE');
    const response: AxiosResponse = await axios.post(endpoint, data, config);
    return response.data;
  }

  private async uploadJob(job: JobInfo, file: string|undefined): Promise<JobInfo> {
    if (file === undefined) {
  throw new SfError('No file available', 'NoFileError');
}
    const data: string = fs.readFileSync(resolve(Common.cwd, file), { encoding: 'utf8' }).toString();
    const config: AxiosRequestConfig = this.generateConfig('text/csv');
    const endpoint: string = this.generateEndpoint('UPLOAD', job.id);
    const response: AxiosResponse = await axios.put(endpoint, data, config);

    if (response.status !== 201) {
      job.errorMessage = response.statusText;
    }
    return job;
  }

  private generateConfig(contentType: string): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${this.conn.accessToken}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };
    return config;
  }

  private generateEndpoint(operation: string, jobid: string = ''): string {
    let endpoint: string = '';
    const job = [this.conn.instanceUrl, this.conn.getApiVersion(), jobid];
    switch (operation) {
      case 'QUERY':
        endpoint = util.format.apply(util, [ENDPOINT.QUERY, ...job]).trim();
        break;
      case 'QUERY_STATUS':
        endpoint = util.format.apply(util, [ENDPOINT.QUERY_STATUS, ...job]).trim();
        break;
      case 'QUERY_RESULT':
        endpoint = util.format.apply(util, [ENDPOINT.QUERY_RESULT, ...job]).trim();
        break;
      case 'CREATE':
        endpoint = util.format.apply(util, [ENDPOINT.CREATE, ...job]).trim();
        break;
      case 'UPLOAD':
        endpoint = util.format.apply(util, [ENDPOINT.UPLOAD, ...job]).trim();
        break;
      case 'STATUS':
        endpoint = util.format.apply(util, [ENDPOINT.STATUS, ...job]).trim();
        break;
      case 'SUCCESS':
        endpoint = util.format.apply(util, [ENDPOINT.SUCCESS, ...job]).trim();
        break;
      case 'FAILED':
        endpoint = util.format.apply(util, [ENDPOINT.FAILED, ...job]).trim();
        break;
      case 'UNPROCESSED':
        endpoint = util.format.apply(util, [ENDPOINT.UNPROCESSED, ...job]).trim();
        break;

      default:
        endpoint = '';
        break;
    }
    return endpoint;
  }
  
  // eslint-disable-next-line class-methods-use-this
  private getFilesizeInMegaBytes(filename: string): number {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes / (1024 * 1024);
  } 
}
