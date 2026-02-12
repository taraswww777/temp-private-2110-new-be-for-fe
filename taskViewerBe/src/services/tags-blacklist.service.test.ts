import { describe, it, expect, beforeEach } from 'vitest';
import { tagsBlacklistService } from './tags-blacklist.service.js';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const TASKS_DIR = process.env.TASKS_DIR || '';
const BLACKLIST_PATH = join(TASKS_DIR, 'youtrack-tags-blacklist.json');

async function clearBlacklistFile() {
  if (existsSync(BLACKLIST_PATH)) {
    await rm(BLACKLIST_PATH, { force: true });
  }
}

describe('tagsBlacklistService', () => {
  beforeEach(async () => {
    await clearBlacklistFile();
  });

  it('getBlacklist returns empty array when file does not exist', async () => {
    const list = await tagsBlacklistService.getBlacklist();
    expect(list).toEqual([]);
  });

  it('setBlacklist writes and getBlacklist returns list', async () => {
    await tagsBlacklistService.setBlacklist(['tag1', 'tag2']);
    const list = await tagsBlacklistService.getBlacklist();
    expect(list).toEqual(['tag1', 'tag2']);
  });

  it('addTag adds tag to blacklist', async () => {
    await tagsBlacklistService.setBlacklist(['a']);
    const next = await tagsBlacklistService.addTag('b');
    expect(next).toContain('a');
    expect(next).toContain('b');
  });

  it('removeTag removes tag from blacklist', async () => {
    await tagsBlacklistService.setBlacklist(['a', 'b']);
    const next = await tagsBlacklistService.removeTag('a');
    expect(next).toEqual(['b']);
  });

  it('filterTagsForYouTrack excludes blacklisted tags (case-insensitive)', async () => {
    await tagsBlacklistService.setBlacklist(['internal', 'draft']);
    const result = await tagsBlacklistService.filterTagsForYouTrack([
      'feature',
      'Internal',
      'DRAFT',
      'prod',
    ]);
    expect(result).toEqual(['feature', 'prod']);
  });
});
