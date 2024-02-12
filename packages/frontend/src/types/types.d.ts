import { Theme as MaterialTheme } from '@mui/material';
import { SearchParameterName } from '../components/Search/FilterSearchData';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true; // adds the `mobile` breakpoint
    tablet: true;
    desktop: true;
  }

  interface Palette {
    transparent: Palette['primary'];
  }

  interface PaletteOptions {
    transparent: PaletteOptions['primary'];
  }
}

declare module '@emotion/react' {
  export interface Theme extends MaterialTheme {}
}

export enum ExtendedSearchParameterName {
  NAME = 'name',
  MODIFIED = 'modified',
}

type TNameSearchParameter = {
  parameterName: ExtendedSearchParameterName.NAME;
  term: string;
  contentSearch?: boolean;
  nameSearch?: boolean;
  titleSearch?: boolean;
  descriptionSearch?: boolean;
};

type TModifiedSearchParameter = {
  parameterName: ExtendedSearchParameterName.MODIFIED;
  from: string | null;
  to?: string | null;
};

type TMimeSearchParameter = {
  parameterName: SearchParameterName.MIME;
  fileTypes: Mime[];
};

type TCategorySearchParameter = {
  parameterName: SearchParameterName.CATEGORY;
  categoryName: string;
};

type TAncestorSearchParameter = {
  parameterName: SearchParameterName.ANCESTOR;
  ancestor: string;
};

type TSearchParameterBody =
  | TNameSearchParameter
  | TModifiedSearchParameter
  | TMimeSearchParameter
  | TCategorySearchParameter
  | TAncestorSearchParameter;

type MainCategoryData = {
  DIAGRAMS: string;
  OPERATIONS: string;
  SPECIALTY_STRUCTURES: string;
  SAFETY_EQUIPMENT: string;
  CONTACT_INFORMATION: string;
  OTHERS: string;
  INSTRUCTIONS: string;
  NOTICE: string;
};

type SubCategoryData = {
  LINE_DIAGRAMS: string;
  SPEED_DIAGRAMS: string;
  TRACK_DIAGRAMS: string;
  GROUPING_DIAGRAMS: string;
  INTERCHANGE_DECISIONS: string;
  RAILWAY_SIGNS: string;
  RAILWAY_ASSET_NUMBERS: string;
  RAILWAY_MAPS: string;
  RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS: string;
  ROUTE_DOCUMENTS: string;
  RINF_REGISTER: string;
  VAK_RAIL_DEPOT: string;
  BRIDGE_INSPECTIONS: string;
  BRIDGE_MAINTENANCE_INSTRUCTIONS: string;
  TUNNELS: string;
  RAILWAY_TUNNEL_RESCUE_PLANS: string;
  SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS: string;
  SAFETY_EQUIPMENT_MANUALS: string;
  INTERCHANGE_CONTACT_INFORMATION: string;
  TRAFFIC_CONTROL_CONTACT_INFORMATION: string;
  MANAGEMENT_REPORTS: string;
  MONITORING_EQUIPMENT: string;
  REGIONAL_LIMITATIONS_DRIVER_ACTIVITY: string;
  PLANNING_ARCHIVE: string;
  RAILWAY_MONITORING_SERVICE: string;
  RAILWAY_CATEGORY: string;
  SEARCH_AND_FILTERS: string;
  FAVORITES: string;
  LOGIN_AND_PERMISSIONS: string;
  EDIT_TOOL: string;
};

type TNode = {
  entry: {
    id: string;
    name: string;
    modifiedAt: string;
    nodeType: string;
    content: any;
    parentId: string;
    isFile: boolean;
    isFolder: boolean;
    properties: {
      'cm:description': string;
      'cm:title': string;
    };
  };
};

export interface AlfrescoPaginatedResponse {
  list: {
    pagination: {
      count: number;
      hasMoreItems: boolean;
      totalItems: number;
      skipCount: number;
      maxItems: number;
    };
    entries: AlfrescoResponse[];
  };
}

interface AlfrescoResponse {
  entry: {
    isFile: boolean;
    createdByUser: {
      id: string;
      displayName: string;
    };
    modifiedAt: Date;
    nodeType: string;
    content: {
      mimeType: string;
      mimeTypeName: string;
      sizeInBytes: number;
      encoding: string;
    };
    parentId: string;
    aspectNames: string[];
    createdAt: string;
    isFolder: string;
    modifiedByUser: {
      id: string;
      displayName: string;
    };
    name: string;
    id: string;
    properties: {
      'cm:versionLabel': number;
      'cm:versionType': string;
    };
  };
}

interface Notice {
  id: string;
  title: string | null;
  content: any;
  authorId: string | null;
  createdTime: Date;
  publishTimeStart: Date;
  publishTimeEnd: Date | null;
  showAsBanner: boolean;
  state: string;
}

interface Activity {
  id: string;
  fileName: string;
  categoryId: string;
  alfrescoId: string;
  timestamp: string;
  action: string;
  mimeType: string;
  activityId: number;
  categoryDataBase: {
    rataextraRequestPage: string;
    alfrescoFolder: string;
  };
}
