/**
 * Типы для работы с YouTrack API
 */

export interface YouTrackProject {
  id: string;
  name: string;
  shortName: string;
}

export interface YouTrackIssue {
  id: string;
  idReadable: string;
  summary: string;
  description?: string;
  state?: {
    name: string;
  };
  priority?: {
    name: string;
  };
  customFields?: Array<{
    name: string;
    value?: {
      name?: string;
      login?: string;
    };
  }>;
}

export interface YouTrackCreateIssueRequest {
  project: { id: string };
  summary: string;
  description?: string;
  customFields?: Array<{
    name: string;
    $type: string;
    value: {
      name?: string;
      login?: string;
    };
  }>;
}

export interface YouTrackCreateIssueResponse {
  id: string;
  idReadable: string;
}
