export const generateYearsBetween = (startYear: number, endYear: number = new Date().getFullYear()) => {
  let years = [];
  while (startYear <= endYear) {
    years.push(startYear);
    startYear++;
  }
  return years;
};

export const flatMapByKey = (array: Array<any>, key: any): Array<any> => {
  return array.reduce((acc: Array<any>, next: Array<any>) => {
    if (!next[key]) return acc;
    return (acc = [...next[key], ...acc]);
  }, []);
};
