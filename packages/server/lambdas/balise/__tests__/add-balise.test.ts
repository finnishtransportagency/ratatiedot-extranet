import { describe, it, expect, vi } from 'vitest';
import { FileUpload as ParsedFileUpload } from '../../../utils/parser';

vi.mock('../../../lambdas/database/client', () => {
  return {
    DatabaseClient: {
      build: vi.fn().mockResolvedValue({
        prisma: {},
      }),
    },
  };
});

import { validateUploadedFiles } from '../add-balise';

describe('validateUploadedFiles', () => {
  describe('Valid files', () => {
    it('should return no errors for valid files', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.leu',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.bis',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid or missing extensions', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.txt',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.doc',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(3);
    });

    it('should return error for missing balise IDs', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: 'document.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: 'file.leu',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(2);
      expect(errors.every((e) => e.error.includes('Virheellinen tiedostonimi'))).toBe(true);
    });
  });

  describe('K suffix validation', () => {
    it('should accept files with K suffix', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345K.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345k.leu',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });

    it('should reject files with invalid suffix (not K)', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345X.il',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345AB.leu',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(2);
      expect(errors.every((e) => e.error.includes('Virheellinen tiedostonimi'))).toBe(true);
    });

    it('should handle case insensitive extensions with K suffix', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345K.IL',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345k.LEU',
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.BIS',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Mismatched balise IDs', () => {
    it('should return error when balise ID in filename does not match target', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.il',
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 54321);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('baliisi-tunnus (12345)');
      expect(errors[0].error).toContain('ei vastaa kohde-baliisia (54321)');
    });

    it('should handle a complex mix of errors', () => {
      const files: ParsedFileUpload[] = [
        {
          filename: '12345.il', // valid
          buffer: Buffer.from('test'),
        },
        {
          filename: 'document.il', // missing ID
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.txt', // invalid extension
          buffer: Buffer.from('test'),
        },
        {
          filename: '99999.leu', // mismatched ID
          buffer: Buffer.from('test'),
        },
        {
          filename: '12345.bis', // valid
          buffer: Buffer.from('test'),
        },
      ];
      const errors = validateUploadedFiles(files, 12345);
      expect(errors).toHaveLength(3);
      expect(errors.map((e) => e.filename)).toEqual(['document.il', '12345.txt', '99999.leu']);
    });
  });
});
