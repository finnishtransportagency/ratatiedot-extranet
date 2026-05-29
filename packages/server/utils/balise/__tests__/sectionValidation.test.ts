import type { PrismaClient } from '../../../generated/prisma/client';
import {
  generateKeyFromName,
  validateRequiredFields,
  validateSectionPrefix,
  validateSectionPrefixUniqueness,
  validateNameUniqueness,
  validateKeyUniqueness,
  createErrorResponse,
  SectionData,
} from '../sectionValidation';

describe('Section Validation', () => {
  describe('generateKeyFromName', () => {
    it('should generate key from simple name', () => {
      expect(generateKeyFromName('Test Section')).toBe('test_section');
    });

    it('should handle Finnish characters', () => {
      expect(generateKeyFromName('Testi Äö Section')).toBe('testi_äö_section');
    });

    it('should handle special characters', () => {
      expect(generateKeyFromName('Test-Section@123!')).toBe('test_section_123');
    });

    it('should handle multiple spaces and underscores', () => {
      expect(generateKeyFromName('  Test    Section  ')).toBe('test_section');
    });

    it('should handle empty string', () => {
      expect(generateKeyFromName('')).toBe('');
    });
  });

  describe('validateRequiredFields', () => {
    const validData: SectionData = {
      name: 'Test Section',
      sectionPrefix: 10,
    };

    it('should pass with all required fields', () => {
      const result = validateRequiredFields(validData);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when name is missing', () => {
      const data: Partial<SectionData> = {
        sectionPrefix: 10,
      };
      const result = validateRequiredFields(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name and sectionPrefix are required');
      expect(result.statusCode).toBe(400);
    });

    it('should fail when sectionPrefix is undefined', () => {
      const data: Partial<SectionData> = {
        name: 'Test Section',
      };
      const result = validateRequiredFields(data);
      expect(result.isValid).toBe(false);
    });

    it('should pass with optional fields', () => {
      const dataWithOptionals = {
        ...validData,
        description: 'Test description',
      };
      const result = validateRequiredFields(dataWithOptionals);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSectionPrefix', () => {
    it('should pass with valid prefix 10', () => {
      const result = validateSectionPrefix(10);
      expect(result.isValid).toBe(true);
    });

    it('should pass with valid prefix 9', () => {
      const result = validateSectionPrefix(9);
      expect(result.isValid).toBe(true);
    });

    it('should pass with valid prefix 1', () => {
      const result = validateSectionPrefix(1);
      expect(result.isValid).toBe(true);
    });

    it('should pass with valid prefix 99', () => {
      const result = validateSectionPrefix(99);
      expect(result.isValid).toBe(true);
    });

    it('should fail with prefix 0', () => {
      const result = validateSectionPrefix(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('sectionPrefix must be an integer between 1 and 99');
      expect(result.statusCode).toBe(400);
    });

    it('should fail with prefix 100', () => {
      const result = validateSectionPrefix(100);
      expect(result.isValid).toBe(false);
    });

    it('should fail with negative prefix', () => {
      const result = validateSectionPrefix(-1);
      expect(result.isValid).toBe(false);
    });

    it('should fail with non-integer prefix', () => {
      const result = validateSectionPrefix(10.5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateSectionPrefixUniqueness', () => {
    const mockFindFirst = vi.fn();
    const mockDatabase = {
      section: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaClient;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should pass when prefix is unique', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await validateSectionPrefixUniqueness(mockDatabase, 10);

      expect(result.isValid).toBe(true);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { sectionPrefix: 10 },
      });
    });

    it('should fail when prefix already exists', async () => {
      mockFindFirst.mockResolvedValue({ id: 'existing-id', sectionPrefix: 10 });

      const result = await validateSectionPrefixUniqueness(mockDatabase, 10);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('A section with this prefix already exists');
      expect(result.statusCode).toBe(400);
    });

    it('should pass when prefix exists but excludeId matches', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await validateSectionPrefixUniqueness(mockDatabase, 10, 'exclude-id');

      expect(result.isValid).toBe(true);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { sectionPrefix: 10, id: { not: 'exclude-id' } },
      });
    });
  });

  describe('validateNameUniqueness', () => {
    const mockFindFirst = vi.fn();
    const mockDatabase = {
      section: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaClient;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should pass when name is unique', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await validateNameUniqueness(mockDatabase, 'Unique Name');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { name: 'Unique Name' },
      });
    });

    it('should fail when name already exists', async () => {
      mockFindFirst.mockResolvedValue({ id: 'existing-id', name: 'Existing Name' });

      const result = await validateNameUniqueness(mockDatabase, 'Existing Name');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Section name already exists');
      expect(result.statusCode).toBe(400);
    });

    it('should pass when name exists but excludeId matches', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await validateNameUniqueness(mockDatabase, 'Existing Name', 'exclude-id');

      expect(result.isValid).toBe(true);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { name: 'Existing Name', id: { not: 'exclude-id' } },
      });
    });
  });

  describe('validateKeyUniqueness', () => {
    const mockFindFirst = vi.fn();
    const mockDatabase = {
      section: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaClient;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should pass when key is unique', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await validateKeyUniqueness(mockDatabase, 'unique_key');

      expect(result.isValid).toBe(true);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { key: 'unique_key' },
      });
    });

    it('should fail when key already exists', async () => {
      mockFindFirst.mockResolvedValue({ id: 'existing-id', key: 'existing_key' });

      const result = await validateKeyUniqueness(mockDatabase, 'existing_key');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('A section with this name (key) already exists');
      expect(result.statusCode).toBe(400);
    });

    it('should pass when key exists but excludeId matches', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await validateKeyUniqueness(mockDatabase, 'existing_key', 'exclude-id');

      expect(result.isValid).toBe(true);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { key: 'existing_key', id: { not: 'exclude-id' } },
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with default status code', () => {
      const response = createErrorResponse('Test error');

      expect(response).toEqual({
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Test error' }),
      });
    });

    it('should create error response with custom status code', () => {
      const response = createErrorResponse('Server error', 500);

      expect(response).toEqual({
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    it('should handle empty error message', () => {
      const response = createErrorResponse('');

      expect(response.body).toBe(JSON.stringify({ error: '' }));
    });
  });
});
