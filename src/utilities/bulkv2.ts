import { UX } from '@salesforce/command';
import { Connection, fs, Messages } from '@salesforce/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { resolve } from 'path';
import * as util from 'util';
import { BulkV2Input, JobInfo } from '../types/bulkv2';
import { Common } from './common';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('siri', 'bulkv2');
enum ENDPOINT {
  QUERY           = '%s/services/data/v%s/jobs/query',
  QUERY_STATUS    = '%s/services/data/v%s/jobs/query/%s',
  QUERY_RESULT    = '%s/services/data/v%s/jobs/query/%s/results',

  CREATE          = '%s/services/data/v%s/jobs/ingest',
  UPLOAD          = '%s/services/data/v%s/jobs/ingest/%s/batches',
  STATUS          = '%s/services/data/v%s/jobs/ingest/%s',
  CLOSE           = '%s/services/data/v%s/jobs/ingest/%s',
  ABORT           = '%s/services/data/v%s/jobs/ingest/%s',
  DELETE          = '%s/services/data/v%s/jobs/ingest/%s',
  FAILED          = '%s/services/data/v%s/jobs/ingest/%s/failedResults',
  UNPROCESSED     = '%s/services/data/v%s/jobs/ingest/%s/unprocessedrecords',
  SUCCESS         = '%s/services/data/v%s/jobs/ingest/%s/successfulResults'
}
export class BulkV2 {

  
  
  private conn: Connection;
  private ux: UX;
  private query: boolean= false;

  constructor(conn: Connection, ux: UX) {
    this.conn = conn;
    this.ux = ux;
  }

  public async operate(input: BulkV2Input): Promise<JobInfo> {
    if (input.operation === 'query') {
      this.query=true;
      let job: JobInfo = await this.createJob(input);
      do{
        job = await this.status(job.id);
      }while(!(job.state==='JobComplete' || job.state==='Failed' || job.state==='Aborted'));
      if(job.state==='JobComplete'){
        await this.results(job.id,'QUERY_RESULT',input.csvfile);
      }else{
        this.ux.log(messages.getMessage('jobStatusInfo', [job.id, job.state]));
      }
      return job;
    } else {
      let job: JobInfo = await this.createJob(input);
      job = await this.uploadJob(job, input.csvfile);
      job = await this.patchJob(job);
      job = await this.status(job.id);
      return job;
    }
  }

  public async status(jobid:string):Promise<JobInfo>{
    let endpoint = this.generateEndpont((this.query)?'QUERY_STATUS':'STATUS', jobid);
    let config: AxiosRequestConfig = this.generateConfig('application/json');
    let response: AxiosResponse = await axios.get(endpoint, config);
    if (response?.status != 200) {
      response.data.errorMessage = response?.statusText+response.data.errorMessage;
    }
    return response.data;
  }

  private async patchJob(job:JobInfo):Promise<JobInfo>{
    let data: String = JSON.stringify({"state":"UploadComplete"});
    let config: AxiosRequestConfig = this.generateConfig('application/json');
    let endpoint = this.generateEndpont('STATUS',job.id);
    let response: AxiosResponse= await axios.patch(endpoint, data, config);
    job=response.data;
    if(response.status != 200){
      job.errorMessage = response.statusText;
    }
    return job;
  }

  private async createJob(input:BulkV2Input):Promise<JobInfo> {
    let data: String = this.generateRequestBody(input);
    let config: AxiosRequestConfig = this.generateConfig('application/json');
    let endpoint = this.generateEndpont((this.query)?'QUERY':'CREATE');
    let response: AxiosResponse= await axios.post(endpoint, data, config);
    return response.data;
  }

  private async uploadJob(job:JobInfo,file:string):Promise<JobInfo> {
    let data:string= fs.readFileSync(resolve(Common.cwd, file),{encoding: "utf8"}).toString();
    let config: AxiosRequestConfig = this.generateConfig('text/csv');
    let endpoint = this.generateEndpont('UPLOAD',job.id);
    let response: AxiosResponse  = await axios.put(endpoint,data, config);
   
    if(response.status != 201){
      job.errorMessage =response.statusText;
    }
    return job;
  }

  public async results(jobid: string,type: string,file: string): Promise<boolean> {
    let job:JobInfo=await this.status(jobid);
    if(job.state !== 'JobComplete'){
      this.ux.log(messages.getMessage('jobStatusInfo', [job.id, job.state]));
      return false;
    }
    
    let endpoint = this.generateEndpont(type, jobid);
    let config: AxiosRequestConfig = this.generateConfig('application/json');
    return axios.get(endpoint, config).then(response => {
      return new Promise((resolved, rejected) => {
        try{
          fs.writeFileSync(resolve(Common.cwd,file),response.data);
          resolved(true);
        }catch(err){
          rejected(err);
        }
      });
    });
  }

  public statusSummary(summary: JobInfo): JobInfo {
    this.ux.log('');
    const formatOutput: string[] = [];
    for (const field in summary) {
      if (Object.prototype.hasOwnProperty.call(summary, field)) {
        formatOutput.push(field);
      }
    }
    formatOutput.splice(0, 1);
    delete summary['$'];
    this.ux.styledHeader(messages.getMessage('jobStatus'));

    this.ux.styledObject(summary, formatOutput);

    return summary;

    /*if (results) {
      const errorMessages: string[] = [];
      results.forEach((result: BatchResultInfo): void => {
        if (result.errors) {
          result.errors.forEach((errMsg) => {
            errorMessages.push(errMsg);
          });
        }
      });
      if (errorMessages.length > 0) {
        this.ux.styledHeader(messages.getMessage('BulkError'));
        errorMessages.forEach((errorMessage) => {
          this.ux.log(errorMessage);
        });
      }
    }*/


  }

  private generateRequestBody(input: BulkV2Input) {
    return JSON.stringify((input.operation === 'upsert') ? {
      "object": input.sobjecttype,
      "externalIdFieldName": input.externalid,
      "operation": input.operation,
      "lineEnding": input.lineending,
      "columnDelimiter": input.delimiter
    } :
      (input.operation === 'query') ? {
        "operation": "query",
        "query": input.query,
        "contentType": "CSV",
        "columnDelimiter": input.delimiter,
        "lineEnding": input.lineending
      } : {
        "object": input.sobjecttype,
        "operation": input.operation,
        "lineEnding": input.lineending,
        "columnDelimiter": input.delimiter
      });
  }

  private generateConfig(contentType: string,accept?: string) {
    let config: AxiosRequestConfig = {
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${this.conn.accessToken}`,
      }
    };
    return config;
  }

  private generateEndpont(operation: string,jobid:string='') {
    let endpoint = null;
    let job=[this.conn.instanceUrl,this.conn.getApiVersion(),jobid];
    switch (operation) {
      case "QUERY":
        endpoint = util.format.apply(util,[ENDPOINT.QUERY,...job]).trim();
        break;
      case "QUERY_STATUS":
      endpoint = util.format.apply(util,[ENDPOINT.QUERY_STATUS,...job]).trim();
      break;
      case "QUERY_RESULT":
      endpoint = util.format.apply(util,[ENDPOINT.QUERY_RESULT,...job]).trim();
      break;
      case "CREATE":
        endpoint = util.format.apply(util,[ENDPOINT.CREATE,...job]).trim();
        break;
      case "UPLOAD":
        endpoint = util.format.apply(util,[ENDPOINT.UPLOAD,...job]).trim();
        break;
      case "STATUS":
        endpoint = util.format.apply(util,[ENDPOINT.STATUS,...job]).trim();
        break;
      case "SUCCESS":
        endpoint = util.format.apply(util,[ENDPOINT.SUCCESS,...job]).trim();
        break;
      case "FAILED":
        endpoint = util.format.apply(util, [ENDPOINT.FAILED, ...job]).trim();
        break;
      case "UNPROCESSED":
        endpoint = util.format.apply(util, [ENDPOINT.UNPROCESSED, ...job]).trim();
        break;

      default:
        endpoint = '';
        break;
    }
    return endpoint;
  }

}
