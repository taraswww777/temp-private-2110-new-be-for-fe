import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../config/env.js', () => ({
  env: {
    YOUTRACK_URL: 'https://yt.test',
    YOUTRACK_TOKEN: 'test-token',
    YOUTRACK_PROJECT_ID: undefined,
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Импорт после моков
const { youtrackApiService } = await import('./youtrack-api.service.js');

function jsonResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function errorResponse(status: number, body = 'Error') {
  return {
    ok: false,
    status,
    headers: new Headers({ 'content-type': 'text/plain' }),
    json: () => Promise.reject(new Error(body)),
    text: () => Promise.resolve(body),
  };
}

describe('YouTrackApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    youtrackApiService.setUnavailableFor(0);
  });

  describe('isConfigured / isUnavailable', () => {
    it('isConfigured returns true when env has URL and token', () => {
      expect(youtrackApiService.isConfigured()).toBe(true);
    });

    it('isUnavailable returns false initially', () => {
      expect(youtrackApiService.isUnavailable()).toBe(false);
    });

    it('setUnavailableFor sets unavailable window, isUnavailable becomes true', () => {
      youtrackApiService.setUnavailableFor(60_000);
      expect(youtrackApiService.isUnavailable()).toBe(true);
    });

    it('setUnavailableFor(0) clears unavailable state', () => {
      youtrackApiService.setUnavailableFor(60_000);
      youtrackApiService.setUnavailableFor(0);
      expect(youtrackApiService.isUnavailable()).toBe(false);
    });
  });

  describe('getIssue', () => {
    it('requests issue and returns parsed response', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          id: '1-1',
          idReadable: 'PROJ-1',
          summary: 'Test issue',
          state: { name: 'Open' },
          priority: { name: 'Normal' },
        })
      );

      const issue = await youtrackApiService.getIssue('PROJ-1', 'summary,state(name),priority(name)');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://yt.test/api/issues/PROJ-1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            Accept: 'application/json',
          }),
        })
      );
      expect(issue.idReadable).toBe('PROJ-1');
      expect(issue.summary).toBe('Test issue');
    });
  });

  describe('getIssueIdReadable', () => {
    it('returns idReadable when present', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ id: '3-994', idReadable: 'VTB-538' })
      );

      const id = await youtrackApiService.getIssueIdReadable('3-994');
      expect(id).toBe('VTB-538');
    });

    it('returns id when idReadable missing', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: '3-994' }));

      const id = await youtrackApiService.getIssueIdReadable('3-994');
      expect(id).toBe('3-994');
    });
  });

  describe('createIssue', () => {
    it('POSTs to /api/issues and returns response', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse({ id: '3-100', idReadable: 'VTB-100' })
        );

      const result = await youtrackApiService.createIssue({
        project: { id: '0-0' },
        summary: 'New issue',
        description: 'Desc',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://yt.test/api/issues',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            project: { id: '0-0' },
            summary: 'New issue',
            description: 'Desc',
          }),
        })
      );
      expect(result.idReadable).toBe('VTB-100');
      expect(result.id).toBe('3-100');
    });

    it('calls getIssueIdReadable when idReadable missing in create response', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ id: '3-100' }))
        .mockResolvedValueOnce(
          jsonResponse({ id: '3-100', idReadable: 'VTB-100' })
        );

      const result = await youtrackApiService.createIssue({
        project: { id: '0-0' },
        summary: 'New',
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.idReadable).toBe('VTB-100');
    });
  });

  describe('applyCommand', () => {
    it('POSTs to /api/commands with query and issues', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await youtrackApiService.applyCommand(['VTB-1', 'VTB-2'], 'subtask of VTB-0');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://yt.test/api/commands',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'subtask of VTB-0',
            issues: [{ idReadable: 'VTB-1' }, { idReadable: 'VTB-2' }],
          }),
        })
      );
    });

    it('does nothing when issueIds empty or query empty', async () => {
      await youtrackApiService.applyCommand([], 'subtask of VTB-0');
      expect(mockFetch).not.toHaveBeenCalled();

      mockFetch.mockClear();
      await youtrackApiService.applyCommand(['VTB-1'], '  ');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('on 5xx sets unavailable and throws', async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(503, 'Service Unavailable'));

      await expect(youtrackApiService.getIssue('PROJ-1')).rejects.toThrow(/YouTrack API error/);
      expect(youtrackApiService.isUnavailable()).toBe(true);
    });

    it('on 4xx throws without setting unavailable', async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(404, 'Not Found'));

      await expect(youtrackApiService.getIssue('PROJ-1')).rejects.toThrow(/YouTrack API error/);
      expect(youtrackApiService.isUnavailable()).toBe(false);
    });
  });

  describe('getIssueUrl', () => {
    it('returns URL for issue after any request has run', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ id: '1-1', idReadable: 'PROJ-1', summary: '' })
      );
      await youtrackApiService.getIssue('PROJ-1');

      const url = youtrackApiService.getIssueUrl('PROJ-1');
      expect(url).toBe('https://yt.test/issue/PROJ-1');
    });
  });
});
