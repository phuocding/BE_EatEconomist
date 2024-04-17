// vietnameseCurrencyFormatter.ts

import accounting from "accounting";

// Hàm để định dạng số tiền
function formatMoney(amount) {
  return accounting.formatMoney(amount, { symbol: "VND", format: "%v %s" });
}

// Xuất module
export { formatMoney };
