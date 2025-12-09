import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { type Notice, Prisma } from '@prisma/client';
import { buildNoticesQuery, buildNoticesCountQuery, getStatus } from '../get-notices';

vi.mock('../client', () => ({
  DatabaseClient: {
    build: vi.fn(() =>
      Promise.resolve({
        notice: {
          findMany: vi.fn(),
          count: vi.fn(),
        },
      }),
    ),
  },
}));

describe('get-notices', () => {
  describe('buildNoticesQuery', () => {
    it('should return query without where clause for admin', () => {
      const isAdmin = true;
      const query = buildNoticesQuery(isAdmin, 10, 0);
      expect(query).not.toHaveProperty('where');
      expect(query.orderBy.publishTimeStart).toBe(Prisma.SortOrder.desc);
      expect(query.take).toBe(10);
      expect(query.skip).toBe(0);
    });

    it('should return query with where clause for non-admin', () => {
      const isAdmin = false;
      const query = buildNoticesQuery(isAdmin, 20, 0);
      expect(query).toHaveProperty('where');
      // @ts-expect-error - testing runtime behavior, type union doesn't reflect actual return value
      expect(query.where.publishTimeStart.lte).toBeInstanceOf(Date);
      // @ts-expect-error - testing runtime behavior, type union doesn't reflect actual return value
      const [publishTimeEnd1, publishTimeEnd2] = query.where!.OR;
      expect(publishTimeEnd1?.publishTimeEnd!.gte).toBeInstanceOf(Date);
      expect(publishTimeEnd2?.publishTimeEnd).toBeNull();
      expect(query.orderBy.publishTimeStart).toBe(Prisma.SortOrder.desc);
      expect(query.take).toBe(20);
      expect(query.skip).toBe(0);
    });
  });

  describe('buildNoticesCountQuery', () => {
    it('should return undefined for admin', () => {
      const isAdmin = true;
      const query = buildNoticesCountQuery(isAdmin);
      expect(query).toBeUndefined();
    });

    it('should return query with where clause for non-admin', () => {
      const isAdmin = false;
      const query = buildNoticesCountQuery(isAdmin);
      expect(query).toHaveProperty('where');
      expect(query!.where!.publishTimeStart.lte).toBeInstanceOf(Date);
      const [publishTimeEnd1, publishTimeEnd2] = query!.where!.OR;
      expect(publishTimeEnd1?.publishTimeEnd!.gte).toBeInstanceOf(Date);
      expect(publishTimeEnd2?.publishTimeEnd).toBeNull();
    });
  });

  describe('shouldIncludeNotice', () => {
    const createNotice = (publishTimeStart: Date, publishTimeEnd: Date | null): Partial<Notice> => ({
      publishTimeStart,
      publishTimeEnd,
    });
    const shouldIncludeNotice = (notice: Notice, isAdmin: boolean, mockNowDate: Date): boolean => {
      if (isAdmin) return true;

      const now = mockNowDate;
      const isStarted = notice.publishTimeStart <= now;
      const isNotExpired = !notice.publishTimeEnd || notice.publishTimeEnd >= now;

      return isStarted && isNotExpired;
    };

    it('should include all notices for admin', () => {
      const expiredNotice = createNotice(new Date('2020-01-01'), new Date('2021-01-01'));
      const MOCK_NOW_DATE = new Date('2025-12-01');
      expect(shouldIncludeNotice(expiredNotice as Notice, true, MOCK_NOW_DATE)).toBe(true);
    });

    it('should exclude expired notices for non-admin', () => {
      const expiredNotice = createNotice(new Date('2020-01-01'), new Date('2021-01-01'));
      const MOCK_NOW_DATE = new Date('2025-12-01');
      expect(shouldIncludeNotice(expiredNotice as Notice, false, MOCK_NOW_DATE)).toBe(false);
    });

    it('should include active notices for non-admin', () => {
      const activeNotice = createNotice(new Date('2024-01-01'), new Date('2026-01-01'));
      const MOCK_NOW_DATE = new Date('2025-12-01');
      expect(shouldIncludeNotice(activeNotice as Notice, false, MOCK_NOW_DATE)).toBe(true);
    });

    it('should include notices without end date for non-admin', () => {
      const ongoingNotice = createNotice(new Date('2024-01-01'), null);
      const MOCK_NOW_DATE = new Date('2025-12-01');
      expect(shouldIncludeNotice(ongoingNotice as Notice, false, MOCK_NOW_DATE)).toBe(true);
    });

    it('should exclude future notices for non-admin', () => {
      const futureNotice = createNotice(new Date('2026-01-01'), null);
      const MOCK_NOW_DATE = new Date('2025-12-01');
      expect(shouldIncludeNotice(futureNotice as Notice, false, MOCK_NOW_DATE)).toBe(false);
    });
  });

  describe('getStatus', () => {
    const MOCK_NOW_DATE = new Date('2025-12-01T00:00:00.000Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_NOW_DATE);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "scheduled" for future notices', () => {
      const notice = { publishTimeStart: new Date('2026-01-01'), publishTimeEnd: null } as Notice;
      expect(getStatus(notice)).toBe('scheduled');
    });
    it('should return "archived" for expired notices', () => {
      const notice = { publishTimeStart: new Date('2020-01-01'), publishTimeEnd: new Date('2021-01-01') } as Notice;
      expect(getStatus(notice)).toBe('archived');
    });
    it('should return "published" for active notices', () => {
      const notice = { publishTimeStart: new Date('2024-01-01'), publishTimeEnd: new Date('2026-01-01') } as Notice;
      expect(getStatus(notice)).toBe('published');
    });
    it('should return "published" for ongoing notices without end date', () => {
      const notice = { publishTimeStart: new Date('2024-01-01'), publishTimeEnd: null } as Notice;
      expect(getStatus(notice)).toBe('published');
    });
  });
});
