import * as fs from 'node:fs';
import * as util from 'node:util';
import path, { resolve as pathResolve } from 'node:path';
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

  public static async fastFileWrite(file: string, data: NodeJS.ReadableStream): Promise<void> {
    return new Promise((resolvePromise, reject) => {
      const filePath = path.resolve(Common.cwd, file);
      const writeStream = fs.createWriteStream(filePath, { flags: 'w' });
      data.pipe(writeStream);
      writeStream.on('close', () => {
        resolvePromise();
      });
      writeStream.on('error', (err) => {
        reject(new SfError(`Failed to write file: ${err.message}`, 'FileWriteError'));
      });
    });
  }

  public static generateRequestBody(input: BulkV2Input): string {
    let requestBody: Record<string, string>;

    if (input.operation === 'upsert') {
      requestBody = {
        object: input.sobjecttype,
        externalIdFieldName: input.externalid ?? '',
        operation: input.operation,
        lineEnding: input.lineending ?? 'LF',
        columnDelimiter: input.delimiter ?? 'COMMA',
      };
    } else if (input.operation === 'query') {
      requestBody = {
        operation: 'query',
        query: input.query ?? '',
        contentType: 'CSV',
        columnDelimiter: input.delimiter ?? 'COMMA',
        lineEnding: input.lineending ?? 'LF',
      };
    } else {
      requestBody = {
        object: input.sobjecttype,
        operation: input.operation,
        lineEnding: input.lineending ?? 'LF',
        columnDelimiter: input.delimiter ?? 'COMMA',
      };
    }

    return JSON.stringify(requestBody);
  }

  public checkFileSizeAndAct(filename: string): string[] {
    const files: string[] = [];
    const size = this.getFilesizeInMegaBytes(filename);
    if (size < 20) {
      files.push(filename);
      return files;
    }

    const numberOfTempFiles = Math.ceil(size / 20);
    const linesArray = fs
      .readFileSync(pathResolve(process.cwd(), filename), { encoding: 'utf8' })
      .toString()
      .split('\n');
    const numberOfLinesInSingleFile = Math.ceil(linesArray.length / numberOfTempFiles);

    const result: string[][] = linesArray.reduce((resultArray: string[][], item: string, index: number) => {
      const chunkIndex = Math.floor(index / numberOfLinesInSingleFile);

      const chunk = resultArray[chunkIndex] ? [...resultArray[chunkIndex], item] : [item];
      return Object.assign([], resultArray, { [chunkIndex]: chunk });
    }, []);

    for (let i = 0; i < result.length; i++) {
      const tempFilename = `temp${i}.csv`;
      files.push(tempFilename);
      fs.writeFileSync(tempFilename, (i === 0 ? '' : '"Id"\n') + result[i].join('\n'), { encoding: 'utf8' });
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

  public async moreResults(
    endpoint: string,
    locator: string,
    file: string
  ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
    try {
      const config: AxiosRequestConfig = this.generateConfig('text/csv');
      config.responseType = 'stream';
      const response = await axios.get<NodeJS.ReadableStream>(endpoint + '?locator=' + locator, {
        ...config,
        responseType: 'stream',
      });
      await BulkV2.fastFileWrite(file, response.data);
      return response;
    } catch (err) {
      throw new SfError(
        `Failed to fetch more results: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'FetchResultsError'
      );
    }
  }

  public async results(jobid: string, type: string, file: string): Promise<boolean> {
    this.query = type.includes('QUERY');
    const job: JobInfo = await this.status(jobid, this.query ? 'QUERY_STATUS' : '');
    if (!(job.state === 'JobComplete' || job.state === 'Failed')) {
      logger.info(messages.getMessage('info.jobStatusInfo', [job.id, job.state]));
      return false;
    }

    const endpoint: string = this.generateEndpoint(type, jobid);
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    config.responseType = 'stream';

    return new Promise<boolean>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      axios.get<NodeJS.ReadableStream>(endpoint, config).then(
        (response: AxiosResponse<NodeJS.ReadableStream>) => {
          this.processResultsRecursive(file, response, endpoint)
            .then((success) => resolve(success))
            .catch((err) => reject(err));
        },
        (err) => {
          reject(
            new SfError(
              `Failed to fetch results: ${err instanceof Error ? err.message : 'Unknown error'}`,
              'FetchError'
            )
          );
        }
      );
    });
  }

  public async status(jobid: string, type: string): Promise<JobInfo> {
    this.query = type.includes('QUERY');
    const endpoint: string = this.generateEndpoint(this.query ? 'QUERY_STATUS' : 'STATUS', jobid);
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    const response: AxiosResponse<JobInfo> = await axios.get<JobInfo>(endpoint, config);
    if (response?.status !== 200) {
      response.data.errorMessage = (response?.statusText ?? '') + (response.data.errorMessage ?? '');
    }
    return response.data;
  }

  private async processResultsRecursive(
    file: string,
    response: AxiosResponse<NodeJS.ReadableStream>,
    endpoint: string
  ): Promise<boolean> {
    try {
      await BulkV2.fastFileWrite(file, response.data);
      let locator: string = response.headers['sforce-locator'] as string;
      const filename = file.substring(0, file.length - 4);
      let i = 0;

      while (locator !== '') {
        i++;
        const nextFile = filename + i + '.csv';
        // eslint-disable-next-line no-await-in-loop
        const res = await this.moreResults(endpoint, locator, nextFile);
        locator = (res.headers['sforce-locator'] as string) || '';
      }
      return true;
    } catch (err) {
      throw new SfError(
        `Error processing results: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'ResultsError'
      );
    }
  }

  private async patchJob(job: JobInfo): Promise<JobInfo> {
    const data: string = JSON.stringify({ state: 'UploadComplete' });
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    const endpoint: string = this.generateEndpoint('STATUS', job.id);
    const response: AxiosResponse<JobInfo> = await axios.patch<JobInfo>(endpoint, data, config);
    const updatedJob: JobInfo = response.data;
    if (response.status !== 200) {
      updatedJob.errorMessage = response.statusText;
    }
    return updatedJob;
  }

  private async createJob(input: BulkV2Input): Promise<JobInfo> {
    const data: string = BulkV2.generateRequestBody(input);
    const config: AxiosRequestConfig = this.generateConfig('application/json');
    const endpoint: string = this.generateEndpoint(this.query ? 'QUERY' : 'CREATE');
    const response: AxiosResponse<JobInfo> = await axios.post(endpoint, data, config);
    return response.data;
  }

  private async uploadJob(job: JobInfo, file: string | undefined): Promise<JobInfo> {
    if (file === undefined) {
      throw new SfError('No file available', 'NoFileError');
    }
    const data: string = fs.readFileSync(path.resolve(Common.cwd, file), { encoding: 'utf8' }).toString();
    const config: AxiosRequestConfig = this.generateConfig('text/csv');
    const endpoint: string = this.generateEndpoint('UPLOAD', job.id);
    const response: AxiosResponse = await axios.put(endpoint, data, config);
    const updatedJob: JobInfo = { ...job };

    if (response.status !== 201) {
      updatedJob.errorMessage = response.statusText;
    }
    return updatedJob;
  }

  private generateConfig(contentType: string): AxiosRequestConfig {
    if (!this.conn.accessToken) {
      throw new SfError('No access token available', 'NoAccessToken');
    }

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
    const instanceUrl = this.conn.instanceUrl;
    const apiVersion = this.conn.getApiVersion();

    if (!instanceUrl) {
      throw new SfError('No instance URL available', 'NoInstanceUrl');
    }

    const baseParams = [instanceUrl, apiVersion, jobid];
    let endpoint: string;

    switch (operation) {
      case 'QUERY':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.QUERY as any, ...baseParams).trim();
        break;
      case 'QUERY_STATUS':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.QUERY_STATUS as any, ...baseParams).trim();
        break;
      case 'QUERY_RESULT':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.QUERY_RESULT as any, ...baseParams).trim();
        break;
      case 'CREATE':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.CREATE as any, ...baseParams).trim();
        break;
      case 'UPLOAD':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.UPLOAD as any, ...baseParams).trim();
        break;
      case 'STATUS':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.STATUS as any, ...baseParams).trim();
        break;
      case 'SUCCESS':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.SUCCESS as any, ...baseParams).trim();
        break;
      case 'FAILED':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.FAILED as any, ...baseParams).trim();
        break;
      case 'UNPROCESSED':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        endpoint = util.format(ENDPOINT.UNPROCESSED as any, ...baseParams).trim();
        break;
      default:
        throw new SfError(`Unknown operation: ${operation}`, 'UnknownOperation');
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
