export const MESSAGES = {
  genericError: "Something went wrong. Please try again.",
  loadDocumentsError: "We couldn't load your documents.",
  loadDocumentError: "We couldn't open this document.",
  saveError: "Changes could not be saved.",
  createError: "The document could not be created.",
  deleteConfirm: "Delete this document? This cannot be undone.",
  importUnsupported: "Only .txt, .md and .docx files can be imported.",
  importError: "That file could not be imported.",
  shareError: "The document could not be shared.",
  noAccess: "You no longer have access to that document.",
  emptyOwned: "No documents yet. Create one or import a file to get started.",
  emptyShared: "Nothing has been shared with you yet.",
} as const;

export const SUPPORTED_IMPORT_EXTENSIONS = [".txt", ".md", ".docx"] as const;
export type SupportedExtension = (typeof SUPPORTED_IMPORT_EXTENSIONS)[number];

/** `accept` value for the import file input — mirrors the extensions above. */
export const IMPORT_ACCEPT_ATTRIBUTE = [
  ".txt",
  ".md",
  ".docx",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");
export const AUTOSAVE_DELAY_MS = 1200;
