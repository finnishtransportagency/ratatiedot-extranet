import { LuceneQueryBuilder, mimeTypesMappingForTests } from '../luceneQueryBuilder';
import { FileType, SearchParameter, SearchParameterName } from '../types';

const luceneQueryBuilder = new LuceneQueryBuilder();
describe('Lucene Query Builder', () => {
  describe('luceneQueryBuilder', () => {
    it('should return query for pdf not in an array', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual('+@cm\\:content.mimetype:"application/pdf"');
    });
    it('should return query for msword in array', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.MSWORD],
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual(
        '+@cm\\:content.mimetype:("application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")',
      );
    });
    it('should return query for msword and pdf in array', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.MSWORD, FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual(
        '+@cm\\:content.mimetype:("application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf")',
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
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual('+@cm\\:modified:[2020-01-01 TO 2020-12-31]');
    });
    it('should return query for modified time from/to when given ISO-8601 datetimes', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020-01-01T00:00',
          to: '2020-12-31T00:00',
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual('+@cm\\:modified:[2020-01-01 TO 2020-12-31]');
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
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual(
        '+@cm\\:modified:[2020-01-01 TO 2020-12-31]+@cm\\:content.mimetype:"application/pdf"',
      );
    });
    it('should return query with autfilled to when given only from', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020-01-01',
        },
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual(
        '+@cm\\:modified:[2020-01-01 TO 2020-12-31]+@cm\\:content.mimetype:"application/pdf"',
      );
    });
    it('should return query with dates spanning start and end of year when given from with only year', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020',
        },
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual(
        '+@cm\\:modified:[2020-01-01 TO 2020-12-31]+@cm\\:content.mimetype:"application/pdf"',
      );
    });
    it('should return query with dates spanning start of from and end of to when given both with only years', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MODIFIED,
          from: '2020',
          to: '2021',
        },
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual(
        '+@cm\\:modified:[2020-01-01 TO 2021-12-31]+@cm\\:content.mimetype:"application/pdf"',
      );
    });
    it('should return query for name', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.NAME,
          fileName: 'test',
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual('+@cm\\:name:"test*"');
    });
    it('should return query for parent', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.PARENT,
          parent: 'testuuid',
        },
      ];
      expect(luceneQueryBuilder.queryBuilder(parameters)).toEqual('+PARENT:"workspace\\://SpacesStore/testuuid"');
    });
  });
  describe('lucenePagination', () => {
    it('should return default pagination if no page given', () => {
      expect(luceneQueryBuilder.pagination()).toEqual({ maxItems: 10, skipCount: 0 });
    });
    it('should return given positive pagination page', () => {
      expect(luceneQueryBuilder.pagination(5)).toEqual({ maxItems: 10, skipCount: 5 });
    });
    it('should return zero given negative pagination page', () => {
      expect(luceneQueryBuilder.pagination(-4)).toEqual({ maxItems: 10, skipCount: 0 });
    });
  });
  describe('mimeTypesMapping', () => {
    it('All mimetypesMappings should start and end with "', () => {
      const flatMimes = Object.values(mimeTypesMappingForTests).flat();
      const mimesStartAndEndWithDoubleQuote = flatMimes.every((mime) => mime.startsWith('"') && mime.endsWith('"'));
      expect(mimesStartAndEndWithDoubleQuote).toEqual(true);
    });
  });
});
