/**
 * Review request constants shared by the browser form and the server.
 * Keep this file free of server-only imports.
 */
export const MAX_REVIEW_NOTES = 2000;

export const REVIEW_TOPICS = [
  { id: 'hosting', label: 'Hosting plan' },
  { id: 'email', label: 'Email accounts' },
  { id: 'domains', label: 'Domains' },
  { id: 'backups', label: 'Backups' },
  { id: 'support', label: 'Support' },
  { id: 'development', label: 'New features or development' },
] as const;

export type ReviewTopicId = (typeof REVIEW_TOPICS)[number]['id'];
