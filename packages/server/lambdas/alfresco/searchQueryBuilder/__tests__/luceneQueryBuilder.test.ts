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
  });
});
