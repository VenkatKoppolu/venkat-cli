# summary
Export files from Salesforce objects to local disk

# description
Export files from Attachment, ContentDocument, or Document objects to your local machine using SOQL queries for filtering.

# examples

- Export all account attachments

  <%= config.bin %> <%= command.id %> --filetype attachment --query "SELECT Id, Name, Body FROM Attachment WHERE ParentId = '001xx000003DHP'" --output-dir ./attachments

- Export Salesforce Files (latest versions)

  <%= config.bin %> <%= command.id %> --filetype contentdocument --query "SELECT Id, ContentDocument.Title, VersionData FROM ContentVersion WHERE IsLatest = true" --output-dir ./files

- Export documents from a folder

  <%= config.bin %> <%= command.id %> --filetype document --query "SELECT Id, Name, Body FROM Document WHERE FolderId = '0lFxx0000000b3'" --output-dir ./documents

# flags.target-org.summary
Salesforce org to retrieve files from

# flags.target-org.description
The Salesforce org to retrieve files from

# flags.filetype.summary
Type of file object

# flags.filetype.description
File type to export: attachment, contentdocument, or document

# flags.query.summary
SOQL query to select files

# flags.query.description
SOQL query to select files (must include Id and file content field)

# flags.output-dir.summary
Output directory for exported files

# flags.output-dir.description
Local directory where files will be saved (created automatically if it doesn't exist)

# flags.use-bulk-api.summary
Force Bulk API usage

# flags.use-bulk-api.description
Force use of Bulk API for all batch sizes (default: auto-detect based on volume)


