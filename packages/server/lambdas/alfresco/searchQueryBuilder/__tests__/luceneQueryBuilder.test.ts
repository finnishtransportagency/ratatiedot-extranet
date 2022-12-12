import { luceneQueryBuilder } from '../luceneQueryBuilder';
import { FileType, SearchParameter, SearchParameterName } from '../types';

describe('Lucene Query Builder', () => {
  describe('luceneQueryBuilder', () => {
    it('should return query with pdf', () => {
      const parameters: Array<SearchParameter> = [
        {
          parameterName: SearchParameterName.MIME,
          fileTypes: [FileType.PDF],
        },
      ];
      expect(luceneQueryBuilder(parameters)).toEqual('+@cm\\:content.mimetype:"application/pdf"');
    });
    it('should return query with msword in array', () => {
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
  });
});
