import { format } from 'date-fns';
import {
  IMimeSearchParameter,
  IModifiedSearchParameter,
  INameSearchParameter,
  Paging,
  SearchParameter,
  SearchParameterName,
} from './types';

const mimeTypesMapping = {
  EXCEL: ['"application/vnd.ms-excel"', '"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"'],
  IMAGE: ['"image/gif"', '"image/jpeg"', '"image/png"', '"image/svg+xml"', '"image/tiff"', '"image/webp"'],
  MSWORD: ['"application/msword"', '"application/vnd.openxmlformats-officedocument.wordprocessingml.document"'],
  PDF: ['"application/pdf"'],
  PRESENTATION: [
    '"application/vnd.ms-powerpoint"',
    '"application/vnd.openxmlformats-officedocument.presentationml.presentation"',
  ],
  TXT: ['"text/plain"'],
};

const DIVIDER = ':';
const SEARCH_START = `+@cm\\${DIVIDER}`;

// Only supports ISO-8601
function buildModifiedQuery(parameter: IModifiedSearchParameter): string {
  return `${SEARCH_START}modified${DIVIDER}[${format(new Date(parameter.from), 'yyyy-MM-dd')} TO ${format(
    new Date(parameter.to),
    'yyyy-MM-dd',
  )}]`;
}

function buildMimeQuery(parameter: IMimeSearchParameter): string {
  let query = `${SEARCH_START}content.mimetype${DIVIDER}`;
  if (parameter.fileTypes.length > 1) {
    const joinedMimes = parameter.fileTypes.map((fileType) => mimeTypesMapping[fileType].join(', ')).join(', ');
    query += `[${joinedMimes}]`;
  } else {
    const fileTypes = parameter.fileTypes[0];
    const mimes = mimeTypesMapping[fileTypes];
    if (mimes.length > 1) {
      const joinedMimes = mimes.join(', ');
      query += `[${joinedMimes}]`;
    } else {
      query += mimes[0];
    }
  }
  return query;
}

function buildNameQuery(parameter: INameSearchParameter): string {
  return `${SEARCH_START}name${DIVIDER}"${parameter.fileName}*"`;
}

export function luceneQueryBuilder(searchParameters: Array<SearchParameter>): string {
  let query = '';
  searchParameters.map((parameter) => {
    switch (parameter.parameterName) {
      case SearchParameterName.MODIFIED:
        query += buildModifiedQuery(parameter);
        break;
      case SearchParameterName.MIME:
        query += buildMimeQuery(parameter);
        break;
      case SearchParameterName.NAME:
        query += buildNameQuery(parameter);
        break;
      default:
    }
  });
  return query;
}

export function lucenePagination(page?: number): Paging {
  return {
    maxItems: 10,
    skipCount: Math.max(page ?? 0, 0),
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

// {
//   "query": {
//     "query": "+@cm\\:name:\"testi*\"",
//     "language": "lucene"
//   }
// }
