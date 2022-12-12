import { IMimeSearchParameter, IModifiedSearchParameter, Paging, SearchParameters } from '.';

const mimeTypesMapping = {
  MSWORD: ['\\"application/msword\\"', '\\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\\"'],
  PDF: ['\\"application/pdf\\"'],
};

const DIVIDER = ':';
const SEARCH_START = '+@cm\\\\' + DIVIDER;

export function luceneQueryBuilder(searchParameters: SearchParameters): string {
  let query = '';
  searchParameters.map((param) => {
    switch (param.parameterName) {
      case 'modified':
        const modifiedParam = param as IModifiedSearchParameter;
        // TODO: from/to conversion to YYYY-MM-DD
        query += SEARCH_START + 'modified' + DIVIDER + '[' + modifiedParam.from + ' TO ' + modifiedParam.to + ']';
        break;
      case 'mime':
        const mimeParam = param as IMimeSearchParameter;
        query += SEARCH_START + 'content.mimetype' + DIVIDER;
        if (mimeParam.fileTypes.length > 1) {
        } else {
          const fileTypes = mimeParam.fileTypes[0];
          const mimes = mimeTypesMapping[fileTypes];
          if (mimes.length > 1) {
            query += '[' + mimes.map((mime) => mime) + ']';
          } else {
            query += mimes[0];
          }
        }
        break;
      default:
    }
  });
  query += '\\"';
  return query;
}

export function lucenePagination(page: number): Paging {
  return {
    maxItems: 10,
    skipCount: page,
  };
}

// {
//   "query": {
//     "query": "+@cm\\:content.mimetype:\"application/msword\"",
//     "language": "lucene"
//   }
// }

// {
//   "query": {
//     "query": "+@cm\\:modified:[2020-01-01 TO 2020-12-31]+@cm\\:content.mimetype:[\"application/msword\", \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"]",
//     "language": "lucene"
//   }
// }

// {
//   "query": {
//     "query": "+@cm\\:modified:[2020-01-01 TO 2020-12-31]+@cm\\:content.mimetype:[\"application/msword\", \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"]",
//     "language": "lucene"
//   },
//   "paging": {
//     "maxItems": "10",
//     "skipCount": "0"
//   }
// }
