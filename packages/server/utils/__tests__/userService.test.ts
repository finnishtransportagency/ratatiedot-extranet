import { describe, it, expect } from 'vitest';
import { parseRoles, validateBaliseReadUser, validateBaliseWriteUser, validateBaliseAdminUser } from '../userService';
import { RataExtraUser } from '../userService';
import { RataExtraLambdaError } from '../errors';

describe('Parse user roles', () => {
  it('Should parse OAM roles from string to array', () => {
    expect(parseRoles('rataextra_user,rataextra_admin')).toStrictEqual(['rataextra_user', 'rataextra_admin']);
  });
  it('Should parse EntraID roles from string to array', () => {
    expect(parseRoles('["rataextra_user","rataextra_admin"]')).toStrictEqual(['rataextra_user', 'rataextra_admin']);
  });
  it('Should parse improperly escaped JSON roles from string to array', () => {
    expect(parseRoles('[\\"rataextra_user\\",\\"rataextra_admin\\"]')).toStrictEqual([
      'rataextra_user',
      'rataextra_admin',
    ]);
  });
  it('Should not fail on empty roles', () => {
    expect(parseRoles('')).toBeUndefined();
  });
});

describe('Balise role validation', () => {
  describe('validateBaliseReadUser', () => {
    it('should allow user with balise read role', () => {
      const user: RataExtraUser = {
        uid: 'user-1',
        roles: ['ratatieto_luku_baliisisanomat'],
      };
      expect(() => validateBaliseReadUser(user)).not.toThrow();
    });

    it('should allow user with balise write role', () => {
      const user: RataExtraUser = {
        uid: 'user-2',
        roles: ['ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseReadUser(user)).not.toThrow();
    });

    it('should allow user with balise admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-3',
        roles: ['ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseReadUser(user)).not.toThrow();
    });

    it('should allow user with multiple balise roles', () => {
      const user: RataExtraUser = {
        uid: 'user-4',
        roles: ['ratatieto_luku_baliisisanomat', 'ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseReadUser(user)).not.toThrow();
    });

    it('should reject user with only static roles', () => {
      const user: RataExtraUser = {
        uid: 'user-5',
        roles: ['ratatieto_luku', 'ratatieto_kirjoitus'],
      };
      expect(() => validateBaliseReadUser(user)).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseReadUser(user)).toThrow('Forbidden');
    });

    it('should reject user with no roles', () => {
      const user: RataExtraUser = {
        uid: 'user-6',
        roles: [],
      };
      expect(() => validateBaliseReadUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with undefined roles', () => {
      const user: RataExtraUser = {
        uid: 'user-7',
      };
      expect(() => validateBaliseReadUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with unrelated roles', () => {
      const user: RataExtraUser = {
        uid: 'user-8',
        roles: ['some_other_role', 'another_role'],
      };
      expect(() => validateBaliseReadUser(user)).toThrow(RataExtraLambdaError);
    });
  });

  describe('validateBaliseWriteUser', () => {
    it('should allow user with balise write role', () => {
      const user: RataExtraUser = {
        uid: 'user-1',
        roles: ['ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseWriteUser(user)).not.toThrow();
    });

    it('should allow user with balise admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-2',
        roles: ['ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseWriteUser(user)).not.toThrow();
    });

    it('should allow user with both write and admin roles', () => {
      const user: RataExtraUser = {
        uid: 'user-3',
        roles: ['ratatieto_kirjoitus_baliisisanomat', 'ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseWriteUser(user)).not.toThrow();
    });

    it('should reject user with only balise read role', () => {
      const user: RataExtraUser = {
        uid: 'user-4',
        roles: ['ratatieto_luku_baliisisanomat'],
      };
      expect(() => validateBaliseWriteUser(user)).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseWriteUser(user)).toThrow('Forbidden');
    });

    it('should reject user with only static write role', () => {
      const user: RataExtraUser = {
        uid: 'user-5',
        roles: ['ratatieto_kirjoitus'],
      };
      expect(() => validateBaliseWriteUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with only static admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-6',
        roles: ['ratatieto_admin'],
      };
      expect(() => validateBaliseWriteUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with no roles', () => {
      const user: RataExtraUser = {
        uid: 'user-7',
        roles: [],
      };
      expect(() => validateBaliseWriteUser(user)).toThrow(RataExtraLambdaError);
    });
  });

  describe('validateBaliseAdminUser', () => {
    it('should allow user with balise admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-1',
        roles: ['ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseAdminUser(user)).not.toThrow();
    });

    it('should allow user with multiple roles including balise admin', () => {
      const user: RataExtraUser = {
        uid: 'user-2',
        roles: ['ratatieto_luku_baliisisanomat', 'ratatieto_admin_baliisisanomat'],
      };
      expect(() => validateBaliseAdminUser(user)).not.toThrow();
    });

    it('should reject user with only balise read role', () => {
      const user: RataExtraUser = {
        uid: 'user-3',
        roles: ['ratatieto_luku_baliisisanomat'],
      };
      expect(() => validateBaliseAdminUser(user)).toThrow(RataExtraLambdaError);
      expect(() => validateBaliseAdminUser(user)).toThrow('Forbidden');
    });

    it('should reject user with only balise write role', () => {
      const user: RataExtraUser = {
        uid: 'user-4',
        roles: ['ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseAdminUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with only static admin role', () => {
      const user: RataExtraUser = {
        uid: 'user-5',
        roles: ['ratatieto_admin'],
      };
      expect(() => validateBaliseAdminUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with balise read and write roles but not admin', () => {
      const user: RataExtraUser = {
        uid: 'user-6',
        roles: ['ratatieto_luku_baliisisanomat', 'ratatieto_kirjoitus_baliisisanomat'],
      };
      expect(() => validateBaliseAdminUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with no roles', () => {
      const user: RataExtraUser = {
        uid: 'user-7',
        roles: [],
      };
      expect(() => validateBaliseAdminUser(user)).toThrow(RataExtraLambdaError);
    });

    it('should reject user with undefined roles', () => {
      const user: RataExtraUser = {
        uid: 'user-8',
      };
      expect(() => validateBaliseAdminUser(user)).toThrow(RataExtraLambdaError);
    });
  });
});
