import { parseRoles } from '../userService';

describe('Parse user roles', () => {
  it('Should parse OAM roles from string to array', () => {
    expect(parseRoles('rataextra_user,rataextra_admin')).toStrictEqual(['rataextra_user', 'rataextra_admin']);
  });
  it('Should parse EntraID roles from string to array', () => {
    // eslint-disable-next-line prettier/prettier
    expect(parseRoles('["rataextra_user","rataextra_admin"]')).toStrictEqual(['rataextra_user', 'rataextra_admin']);
  });
  it('Should parse improperly escaped JSON roles from string to array', () => {
    // eslint-disable-next-line prettier/prettier
    expect(parseRoles('[\\"rataextra_user\\",\\"rataextra_admin\\"]')).toStrictEqual([
      'rataextra_user',
      'rataextra_admin',
    ]);
  });
});
