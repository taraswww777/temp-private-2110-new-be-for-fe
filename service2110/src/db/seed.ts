import { db } from './index.ts';
import { branches, sources } from './schema/index.ts';

/**
 * Скрипт для заполнения справочников тестовыми данными
 */
async function seed() {
  console.log('Starting database seeding...');

  try {
    // Заполнение справочника филиалов (id — UUID)
    console.log('Seeding branches...');
    await db.insert(branches).values([
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        code: '7701',
        name: 'Филиал № 7701 Банка ВТБ (публичное акционерное общество)',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        code: '7702',
        name: 'Филиал № 7702 Банка ВТБ (публичное акционерное общество)',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        code: '7703',
        name: 'Филиал № 7703 Банка ВТБ (публичное акционерное общество)',
      },
    ]).onConflictDoNothing();

    // Заполнение справочника источников
    console.log('Seeding sources...');
    await db.insert(sources).values([
      {
        code: 'SRC001',
        name: 'Источник 1',
        ris: 'RIS001',
      },
      {
        code: 'SRC002',
        name: 'Источник 2',
        ris: 'RIS002',
      },
      {
        code: 'SRC003',
        name: 'Источник 3',
        ris: null,
      },
    ]).onConflictDoNothing();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

// Запуск скрипта
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
