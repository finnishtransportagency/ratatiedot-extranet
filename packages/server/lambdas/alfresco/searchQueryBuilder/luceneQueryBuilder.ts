import { IMimeSearchParameter, IModifiedSearchParameter, Paging, SearchParameter } from './types';

const mimeTypesMapping = {
  MSWORD: ['"application/msword"', '"application/vnd.openxmlformats-officedocument.wordprocessingml.document"'],
  PDF: ['"application/pdf"'],
};

const DIVIDER = ':';
const SEARCH_START = '+@cm\\' + DIVIDER;

// TODO: from/to conversion to YYYY-MM-DD
function buildModifiedQuery(parameter: IModifiedSearchParameter): string {
  return SEARCH_START + 'modified' + DIVIDER + '[' + parameter.from + ' TO ' + parameter.to + ']';
}

function buildMimeQuery(parameter: IMimeSearchParameter): string {
  let query = SEARCH_START + 'content.mimetype' + DIVIDER;
  if (parameter.fileTypes.length > 1) {
    query += '[' + parameter.fileTypes.map((fileType) => mimeTypesMapping[fileType].join(', ')).join(', ') + ']';
  } else {
    const fileTypes = parameter.fileTypes[0];
    const mimes = mimeTypesMapping[fileTypes];
    if (mimes.length > 1) {
      query += '[' + mimes.join(', ') + ']';
    } else {
      query += mimes[0];
    }
  }
  return query;
}

export function luceneQueryBuilder(searchParameters: Array<SearchParameter>): string {
  let query = '';
  searchParameters.map((parameter) => {
    switch (parameter.parameterName) {
      case 'modified':
        query += buildModifiedQuery(parameter);
        break;
      case 'mime':
        query += buildMimeQuery(parameter);
        break;
      default:
    }
  });
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
//     "query": "+@cm\\:content.mimetype:\"application/pdf\"",
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
