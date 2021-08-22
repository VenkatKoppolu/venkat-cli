export interface JobInfo {
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
}

export interface BulkV2Input {
    sobjecttype: string;
    externalid?: string;
    csvfile?: string
    operation: string;
    lineending?: string;
    delimiter?: string;
    query?: string;
}