import { PrismaClient } from '@prisma/client';
import {
  generateKeyFromName,
  validateRequiredFields,
  validateIdRange,
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
      shortName: 'TS',
      idRangeMin: 1,
      idRangeMax: 100,
    };

    it('should pass with all required fields', () => {
      const result = validateRequiredFields(validData);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when name is missing', () => {
      const data: Partial<SectionData> = {
        shortName: 'TS',
        idRangeMin: 1,
        idRangeMax: 100,
      };
      const result = validateRequiredFields(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name, shortName, idRangeMin, and idRangeMax are required');
      expect(result.statusCode).toBe(400);
    });

    it('should fail when shortName is missing', () => {
      const data: Partial<SectionData> = {
        name: 'Test Section',
        idRangeMin: 1,
        idRangeMax: 100,
      };
      const result = validateRequiredFields(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name, shortName, idRangeMin, and idRangeMax are required');
    });

    it('should fail when idRangeMin is undefined', () => {
      const data: Partial<SectionData> = {
        name: 'Test Section',
        shortName: 'TS',
        idRangeMax: 100,
      };
      const result = validateRequiredFields(data);
      expect(result.isValid).toBe(false);
    });

    it('should fail when idRangeMax is undefined', () => {
      const data: Partial<SectionData> = {
        name: 'Test Section',
        shortName: 'TS',
        idRangeMin: 1,
      };
      const result = validateRequiredFields(data);
      expect(result.isValid).toBe(false);
    });

    it('should pass with optional fields', () => {
      const dataWithOptionals = {
        ...validData,
        description: 'Test description',
        color: '#FF0000',
      };
      const result = validateRequiredFields(dataWithOptionals);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateIdRange', () => {
    it('should pass when idRangeMin is less than idRangeMax', () => {
      const result = validateIdRange(1, 100);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when idRangeMin equals idRangeMax', () => {
      const result = validateIdRange(50, 50);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('idRangeMin must be less than idRangeMax');
      expect(result.statusCode).toBe(400);
    });

    it('should fail when idRangeMin is greater than idRangeMax', () => {
      const result = validateIdRange(100, 50);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('idRangeMin must be less than idRangeMax');
    });

    it('should fail with negative idRangeMin', () => {
      const result = validateIdRange(-1, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID ranges must be non-negative');
      expect(result.statusCode).toBe(400);
    });

    it('should fail with negative idRangeMax', () => {
      const result = validateIdRange(0, -1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID ranges must be non-negative');
    });

    it('should fail with both negative values', () => {
      const result = validateIdRange(-100, -50);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID ranges must be non-negative');
    });

    it('should pass with zero as minimum', () => {
      const result = validateIdRange(0, 100);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNameUniqueness', () => {
    const mockFindFirst = jest.fn();
    const mockDatabase = {
      section: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaClient;

    beforeEach(() => {
      jest.clearAllMocks();
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
    const mockFindFirst = jest.fn();
    const mockDatabase = {
      section: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaClient;

    beforeEach(() => {
      jest.clearAllMocks();
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
