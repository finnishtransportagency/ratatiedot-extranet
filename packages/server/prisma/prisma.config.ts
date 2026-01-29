import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
