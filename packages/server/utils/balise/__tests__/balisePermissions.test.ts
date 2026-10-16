import { describe, it, expect } from 'vitest';
import { validateBaliseCapability, hasBaliseCapability, canDeleteBalise } from '../balisePermissions';
import type { RataExtraUser } from '../../userService';
import { RataExtraLambdaError } from '../../errors';

describe('Balise role validation', () => {
  describe('read capability', () => {
    it('should allow user with balise read role', () => {
      const user: RataExtraUser = {
        uid: 'user-1',
        roles: ['ratatieto_luku_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'read')).not.toThrow();
    });

    it('should allow user with balise raide read role', () => {
      const user: RataExtraUser = {
        uid: 'user-1-raide',
        roles: ['ratatieto_luku_baliisisanomat_raide'],
      };
      expect(() => validateBaliseCapability(user, 'read')).not.toThrow();
    });

    it('should allow user with balise write role', () => {
      const user: RataExtraUser = {
        uid: 'user-2',
        roles: ['ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'read')).not.toThrow();
    });

    it('should allow user with balise admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-3',
        roles: ['ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'read')).not.toThrow();
    });

    it('should allow user with multiple balise roles', () => {
      const user: RataExtraUser = {
        uid: 'user-4',
        roles: ['ratatieto_luku_baliisisanomat', 'ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'read')).not.toThrow();
    });

    it('should reject user with only static roles', () => {
      const user: RataExtraUser = {
        uid: 'user-5',
        roles: ['ratatieto_luku', 'ratatieto_kirjoitus'],
      };
      expect(() => validateBaliseCapability(user, 'read')).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseCapability(user, 'read')).toThrow('Forbidden');
    });

    it('should reject user with no roles', () => {
      const user: RataExtraUser = {
        uid: 'user-6',
        roles: [],
      };
      expect(() => validateBaliseCapability(user, 'read')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with undefined roles', () => {
      const user: RataExtraUser = {
        uid: 'user-7',
      };
      expect(() => validateBaliseCapability(user, 'read')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with unrelated roles', () => {
      const user: RataExtraUser = {
        uid: 'user-8',
        roles: ['some_other_role', 'another_role'],
      };
      expect(() => validateBaliseCapability(user, 'read')).toThrow(RataExtraLambdaError);
    });
  });

  describe('write capability', () => {
    it('should allow user with balise write role', () => {
      const user: RataExtraUser = {
        uid: 'user-1',
        roles: ['ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'write')).not.toThrow();
    });

    it('should allow user with balise admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-2',
        roles: ['ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'write')).not.toThrow();
    });

    it('should allow user with both write and admin roles', () => {
      const user: RataExtraUser = {
        uid: 'user-3',
        roles: ['ratatieto_kirjoitus_baliisisanomat', 'ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'write')).not.toThrow();
    });

    it('should reject user with only balise read role', () => {
      const user: RataExtraUser = {
        uid: 'user-4',
        roles: ['ratatieto_luku_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'write')).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseCapability(user, 'write')).toThrow('Forbidden');
    });

    it('should reject user with only static write role', () => {
      const user: RataExtraUser = {
        uid: 'user-5',
        roles: ['ratatieto_kirjoitus'],
      };
      expect(() => validateBaliseCapability(user, 'write')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with only static admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-6',
        roles: ['ratatieto_admin'],
      };
      expect(() => validateBaliseCapability(user, 'write')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with no roles', () => {
      const user: RataExtraUser = {
        uid: 'user-7',
        roles: [],
      };
      expect(() => validateBaliseCapability(user, 'write')).toThrow(RataExtraLambdaError);
    });
  });

  describe('manageSections capability', () => {
    it('should allow user with balise admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-1',
        roles: ['ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).not.toThrow();
    });

    it('should allow user with multiple roles including balise admin', () => {
      const user: RataExtraUser = {
        uid: 'user-2',
        roles: ['ratatieto_luku_baliisisanomat', 'ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).not.toThrow();
    });

    it('should reject user with only balise read role', () => {
      const user: RataExtraUser = {
        uid: 'user-3',
        roles: ['ratatieto_luku_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow('Forbidden');
    });

    it('should reject user with only balise write role', () => {
      const user: RataExtraUser = {
        uid: 'user-4',
        roles: ['ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with only static admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-5',
        roles: ['ratatieto_admin'],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with balise read and write roles but not admin', () => {
      const user: RataExtraUser = {
        uid: 'user-6',
        roles: ['ratatieto_luku_baliisisanomat', 'ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with no roles', () => {
      const user: RataExtraUser = {
        uid: 'user-7',
        roles: [],
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow(RataExtraLambdaError);
    });

    it('should reject user with undefined roles', () => {
      const user: RataExtraUser = {
        uid: 'user-8',
      };
      expect(() => validateBaliseCapability(user, 'manageSections')).toThrow(RataExtraLambdaError);
    });
  });

  describe('balise lite admin', () => {
    const liteAdmin: RataExtraUser = { uid: 'lite-1', roles: ['ratatieto_liteadmin_baliisisanomat'] };

    it('should have read and write access', () => {
      expect(() => validateBaliseCapability(liteAdmin, 'read')).not.toThrow();
      expect(() => validateBaliseCapability(liteAdmin, 'write')).not.toThrow();
    });

    it('should not have admin access', () => {
      expect(() => validateBaliseCapability(liteAdmin, 'manageSections')).toThrow(RataExtraLambdaError);
    });

    it('should be allowed to unlock balises of others', () => {
      expect(hasBaliseCapability(liteAdmin, 'unlockOthers')).toBe(true);
    });
  });

  describe('unlockOthers capability', () => {
    it('should be true only for admin and lite admin', () => {
      expect(hasBaliseCapability({ uid: 'a', roles: ['ratatieto_admin_baliisisanomat'] }, 'unlockOthers')).toBe(true);
      expect(hasBaliseCapability({ uid: 'w', roles: ['ratatieto_kirjoitus_baliisisanomat'] }, 'unlockOthers')).toBe(
        false,
      );
      expect(hasBaliseCapability({ uid: 'r', roles: ['ratatieto_luku_baliisisanomat'] }, 'unlockOthers')).toBe(false);
      expect(hasBaliseCapability({ uid: 'n' }, 'unlockOthers')).toBe(false);
    });
  });

  describe('balise delete capabilities', () => {
    const admin: RataExtraUser = { uid: 'a', roles: ['ratatieto_admin_baliisisanomat'] };
    const liteAdmin: RataExtraUser = { uid: 'l', roles: ['ratatieto_liteadmin_baliisisanomat'] };
    const writer: RataExtraUser = { uid: 'w', roles: ['ratatieto_kirjoitus_baliisisanomat'] };
    const reader: RataExtraUser = { uid: 'r', roles: ['ratatieto_luku_baliisisanomat'] };

    it('should allow delete for write, lite admin and admin', () => {
      expect(hasBaliseCapability(admin, 'delete')).toBe(true);
      expect(hasBaliseCapability(liteAdmin, 'delete')).toBe(true);
      expect(hasBaliseCapability(writer, 'delete')).toBe(true);
      expect(() => validateBaliseCapability(reader, 'delete')).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseCapability({ uid: 'n' }, 'delete')).toThrow(RataExtraLambdaError);
    });

    it('should allow deleting locked balises only for admin', () => {
      expect(hasBaliseCapability(admin, 'deleteLocked')).toBe(true);
      expect(hasBaliseCapability(liteAdmin, 'deleteLocked')).toBe(false);
      expect(hasBaliseCapability(writer, 'deleteLocked')).toBe(false);
    });

    it('should allow viewing history only for admin', () => {
      expect(hasBaliseCapability(admin, 'viewHistory')).toBe(true);
      expect(hasBaliseCapability(liteAdmin, 'viewHistory')).toBe(false);
      expect(hasBaliseCapability(writer, 'viewHistory')).toBe(false);
      expect(hasBaliseCapability(reader, 'viewHistory')).toBe(false);
    });

    it('should allow deleting unlocked balises for delete users', () => {
      expect(canDeleteBalise(writer, { locked: false })).toBe(true);
      expect(canDeleteBalise(liteAdmin, { locked: false })).toBe(true);
      expect(canDeleteBalise(admin, { locked: false })).toBe(true);
      expect(canDeleteBalise(reader, { locked: false })).toBe(false);
    });

    it('should allow deleting locked balises only with deleteLocked', () => {
      expect(canDeleteBalise(admin, { locked: true })).toBe(true);
      expect(canDeleteBalise(liteAdmin, { locked: true })).toBe(false);
      expect(canDeleteBalise(writer, { locked: true })).toBe(false);
      expect(canDeleteBalise(reader, { locked: true })).toBe(false);
    });

    it('should match roles case-insensitively', () => {
      expect(hasBaliseCapability({ uid: 'w', roles: ['RATATIETO_KIRJOITUS_BALIISISANOMAT'] }, 'delete')).toBe(true);
    });
  });
});
