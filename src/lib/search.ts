export const triGram = (txt: string) => {
  const set = new Set();
  const s1 = (txt || '').toLowerCase();
  const n = 3;
  for (let k = 0; k <= s1.length - n; k++)
    set.add(s1.substring(k, k + n))
  return set;

};

