import { log } from '../../../utils/logger';
import { LuceneQueryBuilder } from './luceneQueryBuilder';
import { QueryLanguage, Query, QueryRequest } from './types';
import { getParameter } from '../../../utils/parameterStore';

const alfrescoSitePathName = process.env.ALFRESCO_SITE_PATH || '';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = QueryLanguage.LUCENE,
  additionalFields,
  sort = [],
}: QueryRequest): Query => {
  switch (language) {
    case QueryLanguage.LUCENE:
      // const alfrescoSitePath = await getParameter(alfrescoSitePathName);
      const luceneQueryBuilder = new LuceneQueryBuilder('/app:company_home/st:sites/cm:ratat-extra//*'); //TODO: must remove
      log.info(alfrescoSitePathName, 'alfrescoSitePathName');
      log.info(process.env, 'process.env');
      return {
        query: {
          query: luceneQueryBuilder.queryBuilder(searchParameters),
          // TODO: ANCESTOR? Might not be needed
          language,
        },
        paging: luceneQueryBuilder.pagination(page),
        sort: luceneQueryBuilder.sorting(sort),
        ...(additionalFields && { include: luceneQueryBuilder.additionalFields(additionalFields) }),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
