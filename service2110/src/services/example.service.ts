import type { CreateItemInput, UpdateItemInput } from '../schemas/example.schema.js';
import type { Item } from '../db/schema/index.js';

// Временное хранилище (моки)
const items: Item[] = [];
let idCounter = 1;

export const exampleService = {
  async getAll(): Promise<Item[]> {
    return items;
  },

  async getById(id: number): Promise<Item | null> {
    return items.find((item) => item.id === id) || null;
  },

  async create(data: CreateItemInput): Promise<Item> {
    const newItem: Item = {
      id: idCounter++,
      title: data.title,
      description: data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.push(newItem);
    return newItem;
  },

  async update(id: number, data: UpdateItemInput): Promise<Item | null> {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date(),
    };
    return items[index];
  },

  async delete(id: number): Promise<boolean> {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    return true;
  },
};
