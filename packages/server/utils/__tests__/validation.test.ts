import { validateQueryParameters } from '../validation';

describe('validateQueryParameters', () => {
  it('should pass with correct parameters', () => {
    const params: Record<string, unknown> = {
      category: 'testCategory',
      nestedFolderId: 'testNestedFolderId',
    };
    expect(() => validateQueryParameters(params, ['category', 'nestedFolderId'])).not.toThrow();
  });

  it('should pass with empty parameters', () => {
    const params: Record<string, unknown> = {};
    expect(() => validateQueryParameters(params, ['category', 'nestedFolderId'])).not.toThrow();
  });

  it('should fail with extra parameters', () => {
    const params: Record<string, unknown> = {
      category: 'testCategory',
      nestedFolderId: 'testNestedFolderId',
      extraParam: 'extraParam',
    };
    expect(() => validateQueryParameters(params, ['category', 'nestedFolderId'])).toThrow(
      'Unexpected query parameter: extraParam.  Only valid parameters are: category, nestedFolderId',
    );
  });

  it('should fail with missing expected parameters and one extra parameter', () => {
    const params: Record<string, unknown> = {
      category: 'testCategory',
      extraParam: 'extraParam',
    };
    expect(() => validateQueryParameters(params, ['category', 'nestedFolderId'])).toThrow(
      'Unexpected query parameter: extraParam.  Only valid parameters are: category, nestedFolderId',
    );
  });
});
