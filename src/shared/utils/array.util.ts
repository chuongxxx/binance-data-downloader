export const enumToArray = (enumObject: any) => {
  return Object.keys(enumObject).map((key) => ({
    value: enumObject[key],
    label: key,
  }));
};
