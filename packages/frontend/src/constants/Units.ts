// Ref: https://peda.net/iitti/lukio/oppiaineet/tietotekniikka/atp/bl/tmy

export type FileSizeUnit = {
  b: string;
  bit: string;
  B: string;
  kB: string;
  MB: string;
  GB: string;
  TB: string;
  PB: string;
};

export enum LocaleLang {
  fi = 'fi',
  FI = 'fi',
  'fi-FI' = 'fi',
}

export const LocaleUnit: { [name in LocaleLang]: FileSizeUnit } = {
  fi: { b: 'b', bit: 'b', B: 't', kB: 'kt', MB: 'Mt', GB: 'Gt', TB: 'Tt', PB: 'Pt' },
};
