export interface RepoFile {
  path: string;
  content: string;
}

export interface RepoBundle {
  repoId: string;
  owner: string;
  repo: string;
  branch: string;
  files: RepoFile[];
  fileTree: string[]; // all paths, including ones dropped from `files`
  stats: RepoStats;
}

export interface RepoStats {
  filesLoaded: number;
  filesTotal: number;
  totalChars: number;
  truncated: boolean; // true if we hit the file/char cap
}

export interface Citation {
  path: string;
  startLine: number; // 1-indexed, inclusive
  endLine: number; // 1-indexed, inclusive
}

export interface IngestResponse {
  repoId: string;
  fileTree: string[];
  stats: RepoStats;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export type DocType = "onboarding" | "architecture";

export interface DocsResponse {
  markdown: string;
}

export type Severity = "high" | "medium" | "low";

export interface DriftFinding {
  docFile: string; // where the stale claim lives
  claim: string; // the doc text that is wrong/outdated
  contradictingCode: Citation;
  explanation: string;
  severity: Severity;
}

export interface DriftResponse {
  findings: DriftFinding[];
}

export interface ApiError {
  error: string;
}
