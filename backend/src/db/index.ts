import { PrismaClient } from '@prisma/client';
import path from 'path';

let prismaInstance: PrismaClient | null = null;
let currentDbUrl: string | null = null;

export function getPrisma(): PrismaClient {
  const dbPath = process.env.DATABASE_PATH;
  let targetUrl = process.env.DATABASE_URL;

  if (!targetUrl && dbPath) {
    targetUrl = dbPath.startsWith('file:') ? dbPath : `file:${dbPath}`;
  }

  if (!targetUrl) {
    const defaultDb = path.resolve(__dirname, '../../roast_master.db');
    targetUrl = `file:${defaultDb}`;
  }

  if (!prismaInstance || currentDbUrl !== targetUrl) {
    if (prismaInstance) {
      prismaInstance.$disconnect().catch(() => {});
    }
    currentDbUrl = targetUrl;
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: targetUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrisma();
    const val = (instance as any)[prop];
    if (typeof val === 'function') {
      return val.bind(instance);
    }
    return val;
  },
});

export async function initDatabase(): Promise<void> {
  const client = getPrisma();
  await client.$connect();
}
