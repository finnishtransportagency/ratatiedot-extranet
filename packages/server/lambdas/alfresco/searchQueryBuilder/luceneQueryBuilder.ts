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
  IFolderSearchParameter,
  IAncestorSearchParameter,
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
  defaultPath: string;

  constructor(defaultPath: string) {
    this.defaultPath = defaultPath;
  }

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

  searchStringToArray(sentence: string) {
    return sentence.split(' ');
  }

  removeSpecialCharacters(sentence: string) {
    // Replace any special character (!?,._ etc.) with "?".
    // The ?-character is single character wildcad rather than * that could fill multiple characters.
    return sentence.match(/[a-ö]|[0-9]|[-]|\s/gi)?.join('');
  }

  addWildcard(searchTerms: string[]): string {
    const parsedSentence = searchTerms.map((term) => `${term}*`).join(' ');
    return parsedSentence;
  }

  buildNameQuery(parameter: INameSearchParameter): string {
    const fileType = '+TYPE:"cm:content"';
    const defaultPathQuery = this.defaultPath ? `+PATH:\"${this.defaultPath}\"` : '';
    const searchTerm = this.removeSpecialCharacters(parameter.term);
    const searchTermWildCard = this.addWildcard(this.searchStringToArray(searchTerm as string));

    const searchTermAmount = this.searchStringToArray(searchTerm as string).length;
    // cannot use Lucene search proximity when querying only one word.
    const searchProximity = searchTermAmount > 1 ? `~3` : `~`;

    // relevance level of matching documents based on the terms found
    // By default, the boost factor is 1. Although the boost factor must be positive, it can be less than 1
    // https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Boosting%20a%20Term
    const relevanceBoost = { text: 1, name: 4, title: 4, description: 2 };

    const contentSearchQuery = `TEXT:\"${searchTerm}\"${searchProximity}^${relevanceBoost.text}`;
    const fileNameSearchQuery = `@cm\\:name:(\"${searchTermWildCard}\" OR \"${searchTerm}\"${searchProximity})^${relevanceBoost.name}`;
    const fileTitleSearchQuery = `@cm\\:title:(\"${searchTermWildCard}\" OR \"${searchTerm}\"${searchProximity})^${relevanceBoost.title}`;
    const descriptionSearchQuery = `@cm\\:description:(\"${searchTermWildCard}\" OR \"${searchTerm}\"${searchProximity})^${relevanceBoost.description}`;

    const extendedSearchQuery = `${fileNameSearchQuery} OR ${fileTitleSearchQuery} OR ${descriptionSearchQuery} OR ${contentSearchQuery}`;

    const searchQuery = [];

    if (parameter.contentSearch) {
      searchQuery.push(contentSearchQuery);
    }
    if (parameter.nameSearch) {
      searchQuery.push(fileNameSearchQuery);
    }
    if (parameter.titleSearch) {
      searchQuery.push(fileTitleSearchQuery);
    }
    if (parameter.descriptionSearch) {
      searchQuery.push(descriptionSearchQuery);
    }

    if (searchQuery.length > 0) {
      return `+(${searchQuery.join(' OR ')})${fileType}${defaultPathQuery}`;
    }

    return `+(${extendedSearchQuery})${fileType}${defaultPathQuery}`;
  }

  buildParentQuery(parameter: IParentSearchParameter) {
    return `+PARENT:\"workspace\\://SpacesStore/${parameter.parent}\"`;
  }

  buildAncestorQuery(parameter: IAncestorSearchParameter) {
    return `+ANCESTOR:\"workspace\\://SpacesStore/${parameter.ancestor}\"`;
  }

  buildFolderQuery(parameter: IFolderSearchParameter) {
    const folderType = '+TYPE:"cm:folder"';
    return `+@cm\\:name:"${parameter.name}"${folderType}`;
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
        case SearchParameterName.ANCESTOR:
          query += this.buildAncestorQuery(parameter);
          break;
        case SearchParameterName.FOLDER:
          query += this.buildFolderQuery(parameter);
        default:
      }
    });
    return query;
  }

  public pagination(page?: number): Paging {
    return {
      maxItems: 50,
      skipCount: Math.max(page ?? 0, 0) * 50, // skip number of items
    };
  }

  public sorting(param: SortingParameter): Sorting[] {
    return [
      {
        type: 'FIELD',
        field: `cm:${param.field}`,
        ascending: param.ascending,
      },
    ];
  }
}
