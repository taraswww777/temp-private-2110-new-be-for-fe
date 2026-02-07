import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';
import type {
  QueueOperation,
  QueueManifest,
  CreateIssueOperation,
  LinkIssueOperation,
  UnlinkIssueOperation,
} from '../types/queue.types.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const QUEUE_DIR = join(TASKS_DIR, 'youtrack-queue');
const QUEUE_FILE = join(QUEUE_DIR, 'queue.json');

/**
 * Сервис для работы с очередью операций YouTrack
 */
export const youtrackQueueService = {
  /**
   * Убедиться, что папка для очереди существует
   */
  async ensureQueueDir(): Promise<void> {
    if (!existsSync(QUEUE_DIR)) {
      await mkdir(QUEUE_DIR, { recursive: true });
    }
  },

  /**
   * Загрузить очередь из файла
   */
  async loadQueue(): Promise<QueueManifest> {
    await this.ensureQueueDir();

    if (!existsSync(QUEUE_FILE)) {
      return { operations: [] };
    }

    const content = await readFile(QUEUE_FILE, 'utf-8');
    return JSON.parse(content);
  },

  /**
   * Сохранить очередь в файл
   */
  async saveQueue(manifest: QueueManifest): Promise<void> {
    await this.ensureQueueDir();

    // Атомарная запись: сначала пишем во временный файл, потом переименовываем
    const tempFile = `${QUEUE_FILE}.tmp`;
    await writeFile(tempFile, JSON.stringify(manifest, null, 2), 'utf-8');

    const { rename } = await import('fs/promises');
    await rename(tempFile, QUEUE_FILE);
  },

  /**
   * Добавить операцию в очередь
   */
  async enqueue(operation: Omit<QueueOperation, 'id' | 'status' | 'createdAt' | 'attempts'>): Promise<QueueOperation> {
    const queue = await this.loadQueue();

    const baseOperation = {
      id: randomUUID(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    let newOperation: QueueOperation;
    if (operation.type === 'create_issue') {
      newOperation = {
        ...baseOperation,
        ...operation,
      } as CreateIssueOperation;
    } else if (operation.type === 'link_issue') {
      newOperation = {
        ...baseOperation,
        ...operation,
      } as LinkIssueOperation;
    } else {
      newOperation = {
        ...baseOperation,
        ...operation,
      } as UnlinkIssueOperation;
    }

    queue.operations.push(newOperation);
    await this.saveQueue(queue);

    return newOperation;
  },

  /**
   * Получить все операции со статусом pending
   */
  async getPendingOperations(): Promise<QueueOperation[]> {
    const queue = await this.loadQueue();
    return queue.operations.filter(op => op.status === 'pending');
  },

  /**
   * Обновить статус операции
   */
  async updateOperationStatus(
    operationId: string,
    status: QueueOperation['status'],
    error?: string,
    result?: QueueOperation['result']
  ): Promise<void> {
    const queue = await this.loadQueue();
    const operation = queue.operations.find(op => op.id === operationId);

    if (!operation) {
      throw new Error(`Operation with id "${operationId}" not found`);
    }

    operation.status = status;
    operation.lastAttemptAt = new Date().toISOString();
    // Увеличиваем attempts только при ошибке или повторной попытке (pending), не при completed/processing
    if (status === 'failed' || status === 'pending') {
      operation.attempts += 1;
    }

    if (error) {
      operation.error = error;
    }

    if (result) {
      operation.result = result;
    }

    await this.saveQueue(queue);
  },

  /**
   * Удалить выполненную операцию (опционально, можно оставить для истории)
   */
  async removeOperation(operationId: string): Promise<void> {
    const queue = await this.loadQueue();
    queue.operations = queue.operations.filter(op => op.id !== operationId);
    await this.saveQueue(queue);
  },

  /**
   * Получить операцию по ID
   */
  async getOperation(operationId: string): Promise<QueueOperation | null> {
    const queue = await this.loadQueue();
    return queue.operations.find(op => op.id === operationId) || null;
  },

  /**
   * Получить все операции (для отладки/мониторинга)
   */
  async getAllOperations(): Promise<QueueOperation[]> {
    const queue = await this.loadQueue();
    return queue.operations;
  },
};
