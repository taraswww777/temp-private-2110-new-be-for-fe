import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const testTasksDir = join(process.cwd(), 'test-tmp');
process.env.TASKS_DIR = testTasksDir;
if (!existsSync(testTasksDir)) {
  mkdirSync(testTasksDir, { recursive: true });
}
