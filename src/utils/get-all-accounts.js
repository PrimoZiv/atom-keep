export default function getAllAccounts(raw) {
  const accounts = new Set();
  raw.forEach((r) => {
    r.outgo.forEach((o) => accounts.add(o.account));
    r.income.forEach((i) => accounts.add(i.account));
  });
  return [...accounts];
}
