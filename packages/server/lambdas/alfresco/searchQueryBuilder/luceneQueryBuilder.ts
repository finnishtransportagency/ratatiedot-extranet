import { format, set } from 'date-fns';
import { SearchQueryBuilder } from './searchQueryBuilder';
import {
  IMimeSearchParameter,
  IModifiedSearchParameter,
  INameSearchParameter,
  AdditionalFields,
  IParentSearchParameter,
  Paging,
  SearchParameter,
  SearchParameterName,
  Sorting,
  SortingParameter,
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
// Exported for testing, not meant for general usage
export const mimeTypesMappingForTests = mimeTypesMapping;

const DIVIDER = ':';
const METADATA_SEARCH_START = `+@cm\\${DIVIDER}`;

const YEAR = new RegExp(/^\d{4}$/);
const onlyYear = (date: string) => YEAR.test(date);

export class LuceneQueryBuilder implements SearchQueryBuilder {
  // Filters values that are not approved
  additionalFields(additionalFields: Array<AdditionalFields>): Array<AdditionalFields> {
    return additionalFields.filter((val) => Object.values(AdditionalFields).includes(val));
  }
  // Only supports ISO-8601 and YYYY
  // In case of only year given, set from to first day of the year and to to last day of the year
  // If to missing, set to to last day of from year
  buildModifiedQuery(parameter: IModifiedSearchParameter): string {
    const from = onlyYear(parameter.from)
      ? set(new Date(parameter.from), { month: 0, date: 1 })
      : new Date(parameter.from);
    const to = parameter.to
      ? onlyYear(parameter.to)
        ? set(new Date(parameter.to), { month: 11, date: 31 })
        : new Date(parameter.to)
      : set(new Date(parameter.from), { month: 11, date: 31 });
    return `${METADATA_SEARCH_START}modified${DIVIDER}[${format(from, 'yyyy-MM-dd')} TO ${format(to, 'yyyy-MM-dd')}]`;
  }

  buildMimeQuery(parameter: IMimeSearchParameter): string {
    let query = `${METADATA_SEARCH_START}content.mimetype${DIVIDER}`;
    if (parameter.fileTypes.length > 1) {
      const joinedMimes = parameter.fileTypes.map((fileType) => mimeTypesMapping[fileType].join(', ')).join(', ');
      query += `(${joinedMimes})`;
    } else {
      const fileTypes = parameter.fileTypes[0];
      const mimes = mimeTypesMapping[fileTypes];
      if (mimes.length > 1) {
        const joinedMimes = mimes.join(', ');
        query += `(${joinedMimes})`;
      } else {
        query += mimes[0];
      }
    }
    return query;
  }

  buildNameQuery(parameter: INameSearchParameter): string {
    const contentSearchQuery = `TEXT:"${parameter.term}*"`;
    const basicSearchQuery = `@cm\\:name:"${parameter.term}*"`;
    const extendedSearchQuery = `+(${contentSearchQuery} ${basicSearchQuery})`;
    return parameter.contentSearch ? `+${contentSearchQuery}` : extendedSearchQuery;
  }

  buildParentQuery(parameter: IParentSearchParameter) {
    return `+PARENT:\"workspace\\://SpacesStore/${parameter.parent}\"`;
  }

  public queryBuilder(searchParameters: Array<SearchParameter>): string {
    let query = '';
    searchParameters?.map((parameter) => {
      switch (parameter.parameterName) {
        case SearchParameterName.MODIFIED:
          query += this.buildModifiedQuery(parameter);
          break;
        case SearchParameterName.MIME:
          query += this.buildMimeQuery(parameter);
          break;
        case SearchParameterName.NAME:
          query += this.buildNameQuery(parameter);
          break;
        case SearchParameterName.PARENT:
          query += this.buildParentQuery(parameter);
          break;
        default:
      }
    });
    return query;
  }

  public pagination(page?: number): Paging {
    return {
      maxItems: 25,
      skipCount: Math.max(page ?? 0, 0) * 25, // skip number of items
    };
  }

  public sorting(params?: SortingParameter[]): [] | Sorting[] {
    return params && params.length
      ? params.map((param: SortingParameter) => {
          return {
            type: 'FIELD',
            field: `cm:${param.field}`,
            ascending: param.ascending,
          };
        })
      : [];
  }
}
