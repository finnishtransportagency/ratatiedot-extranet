import { lucenePagination, luceneQueryBuilder } from '../luceneQueryBuilder';
import { FileType, SearchParameter, SearchParameterName } from '../types';

describe('Lucene Query Builder', () => {
  describe('luceneQueryBuilder', () => {
    it('should return query for pdf not in an array', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual('+@cm\\:content.mimetype:"application/pdf"');
    });
    it('should return query for msword in array', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.MSWORD],
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual(
        '+@cm\\:content.mimetype:["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]',
      );
    });
    it('should return query for msword and pdf in array', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.MSWORD, FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual(
        '+@cm\\:content.mimetype:["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"]',
      );
    });
    it('should return query for modified time from/to when given dates in ISO-8601 format', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020-01-01',
          to: '2020-12-31',
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual('+@cm\\:modified:[2020-01-01 TO 2020-12-31]');
    });
    it('should return query for modified time from/to when given ISO-8601 datetimes', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020-01-01T00:00',
          to: '2020-12-31T00:00',
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual('+@cm\\:modified:[2020-01-01 TO 2020-12-31]');
    });
    it('should return query for modified time from/to and mime pdf when given both', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020-01-01',
          to: '2020-12-31',
        },
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual(
        '+@cm\\:modified:[2020-01-01 TO 2020-12-31]+@cm\\:content.mimetype:"application/pdf"',
      );
    });
    it('should return query for name', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.NAME,
          fileName: 'test',
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual('+@cm\\:name:"test*"');
    });
  });
  describe('lucenePagination', () => {
    it('should return default pagination if no page given', () => {
      expect(lucenePagination()).toEqual({ maxItems: 10, skipCount: 0 });
    });
  });
  describe('lucenePagination', () => {
    it('should return given positive pagination page', () => {
      expect(lucenePagination(5)).toEqual({ maxItems: 10, skipCount: 5 });
    });
  });

  describe('lucenePagination', () => {
    it('should return zero given negative pagination page', () => {
      expect(lucenePagination(-4)).toEqual({ maxItems: 10, skipCount: 0 });
    });
  });
});
