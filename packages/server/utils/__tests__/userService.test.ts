import { describe, it, expect } from 'vitest';
import { parseRoles, validateWriteUser, validateReadUser, validateAdminUser, STATIC_ROLES } from '../userService';
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

describe('Validate read user', () => {
  it('allows read for user with read role', () => {
    const user: RataExtraUser = {
      uid: 'user-1',
      roles: [STATIC_ROLES.read],
    };
    expect(() => validateReadUser(user)).not.toThrow();
  });

  it("doesn't allow read for user with only a write role", () => {
    const user: RataExtraUser = {
      uid: 'user-2',
      roles: [STATIC_ROLES.write],
    };
    expect(() => validateReadUser(user)).toThrow(RataExtraLambdaError);
    expect(() => validateReadUser(user)).toThrow('Forbidden');
  });

  it("doesn't allow read for user with only an admin role", () => {
    const user: RataExtraUser = {
      uid: 'user-3',
      roles: [STATIC_ROLES.admin],
    };
    expect(() => validateReadUser(user)).toThrow(RataExtraLambdaError);
    expect(() => validateReadUser(user)).toThrow('Forbidden');
  });

  it("doesn't allow read for user with no read/write/admin role", () => {
    const user: RataExtraUser = {
      uid: 'user-4',
      roles: ['some_other_role'],
    };
    expect(() => validateReadUser(user)).toThrow(RataExtraLambdaError);
    expect(() => validateReadUser(user)).toThrow('Forbidden');
  });

  it('throws error for user with empty roles', () => {
    const user: RataExtraUser = {
      uid: 'user-5',
      roles: [],
    };
    expect(() => validateReadUser(user)).toThrow(RataExtraLambdaError);
    expect(() => validateReadUser(user)).toThrow('Forbidden');
  });
});

describe('Validate user with mixed case roles', () => {
  it('allows read for user with read role in different case', () => {
    const user: RataExtraUser = {
      uid: 'user-1',
      roles: ['RaTaTiEtO_lUkU'],
    };
    expect(() => validateReadUser(user)).not.toThrow();
  });

  it('allows write for user with write role in different case', () => {
    const user: RataExtraUser = {
      uid: 'user-2',
      roles: ['RaTaTiEtO_kIrJoItUs_cAtEgOrYnAmE'],
    };
    expect(() => validateWriteUser(user, 'ratatieto_kirjoitus_categoryname')).not.toThrow();
  });

  it('allows write for user with static write role in different case', () => {
    const user: RataExtraUser = {
      uid: 'user-2',
      roles: ['RaTaTiEtO_kIrJoItUs'],
    };
    expect(() => validateWriteUser(user, 'any required write role')).not.toThrow();
  });

  it('allows admin for user with admin role in different case', () => {
    const user: RataExtraUser = {
      uid: 'user-3',
      roles: ['RaTaTiEtO_aDmIn'],
    };
    expect(() => validateAdminUser(user)).not.toThrow();
  });
});

describe('Validate write user', () => {
  it('allows write for correct write role', () => {
    const user: RataExtraUser = {
      uid: 'user-1',
      roles: ['Ratatieto_kirjoitus_categoryname'],
    };
    expect(() => validateWriteUser(user, 'Ratatieto_kirjoitus_categoryname')).not.toThrow();
  });

  it('allows any write for static write role', () => {
    const user: RataExtraUser = {
      uid: 'user-2',
      roles: [STATIC_ROLES.write],
    };
    expect(() => validateWriteUser(user, 'any required write role')).not.toThrow();
  });

  it('allows any write for admin role', () => {
    const user: RataExtraUser = {
      uid: 'user-3',
      roles: [STATIC_ROLES.admin],
    };
    expect(() => validateWriteUser(user, 'any required write role')).not.toThrow();
  });

  it('throws error for missing write role', () => {
    const user: RataExtraUser = {
      uid: 'user-4',
      roles: ['some_other_role'],
    };
    expect(() => validateWriteUser(user, 'Ratatieto_kirjoitus_categoryname')).toThrow(RataExtraLambdaError);
    expect(() => validateWriteUser(user, 'Ratatieto_kirjoitus_categoryname')).toThrow('Forbidden');
  });

  it('throws error for user with empty roles', () => {
    const user: RataExtraUser = {
      uid: 'user-5',
      roles: [],
    };
    expect(() => validateWriteUser(user, 'Ratatieto_kirjoitus_categoryname')).toThrow(RataExtraLambdaError);
    expect(() => validateWriteUser(user, 'Ratatieto_kirjoitus_categoryname')).toThrow('Forbidden');
  });
});

describe('Validate admin user', () => {
  it('allows admin for admin role', () => {
    const user: RataExtraUser = {
      uid: 'user-1',
      roles: [STATIC_ROLES.admin],
    };
    expect(() => validateAdminUser(user)).not.toThrow();
  });

  it('throws error for missing admin role', () => {
    const user: RataExtraUser = {
      uid: 'user-2',
      roles: ['some_other_role'],
    };
    expect(() => validateAdminUser(user)).toThrow(RataExtraLambdaError);
    expect(() => validateAdminUser(user)).toThrow('Forbidden');
  });

  it('throws error for user with empty roles', () => {
    const user: RataExtraUser = {
      uid: 'user-3',
      roles: [],
    };
    expect(() => validateAdminUser(user)).toThrow(RataExtraLambdaError);
    expect(() => validateAdminUser(user)).toThrow('Forbidden');
  });
});
