export interface IBalise {
  id: string;
  secondaryId: number;
  version: string;
  description: string;
  createdTime: string;
  createdBy: string;
  editedTime: string;
  editedBy: string;
  locked: boolean;
  area?: string;
  versions?: IBaliseVersion[];
}

export interface IBaliseVersion {
  version: string;
  description: string;
  createdTime: string;
  createdBy: string;
}

export interface BaliseFilters {
  searchTerm: string;
  selectedArea: string | null;
}

export interface AreaConfig {
  key: string;
  name: string;
  shortName: string;
}
