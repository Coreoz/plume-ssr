export const areRecordsEqual = (record1: Record<string, unknown>, record2: Record<string, unknown>) => {
  const keys1 = Object.keys(record1);
  const keys2 = Object.keys(record2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (record1[key] !== record2[key]) {
      return false;
    }
  }

  return true;
};
