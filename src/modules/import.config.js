import { outgoTypes, incomeTypes } from "../contants";

export const outgoOptions = outgoTypes.map((c) => ({ label: c, value: c }));
export const incomeOptions = incomeTypes.map((c) => ({
  label: c,
  value: c,
}));
