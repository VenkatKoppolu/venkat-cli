export type JobInfo = {
  id: string;
  operation: string;
  object: string;
  createdById: string;
  createdDate: Date;
  systemModstamp: Date;
  state: string;

  externalIdFieldName?: string;
  concurrencyMode: string;
  contentType: string;
  apiVersion: number;
  contentUrl: string;
  jobType?: string;
  lineEnding?: string;
  columnDelimiter?: string;

  numberRecordsProcessed?: number;
  numberRecordsFailed?: number;
  retries?: number;
  totalProcessingTime?: number;
  apiActiveProcessingTime?: number;
  apexProcessingTime?: number;

  status?: string;
  errorMessage?: string;
};

// Valid Bulk API 2.0 operations. Ingest jobs use insert/update/upsert/delete/hardDelete;
// query jobs use query. Keeping this a union lets the compiler reject typos like 'hard'.
export type BulkOperation = 'insert' | 'update' | 'upsert' | 'delete' | 'hardDelete' | 'query';

export type BulkV2Input = {
  sobjecttype: string;
  externalid?: string;
  csvfile?: string;
  operation: BulkOperation;
  lineending?: string;
  delimiter?: string;
  query?: string;
};
