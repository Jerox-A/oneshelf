export const currencies = [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "EGP", label: "Egyptian Pound", symbol: "E£" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "AED", label: "UAE Dirham", symbol: "AED" },
    { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
  ];
  
  export function getCurrencySymbol(currencyCode: string | null | undefined) {
    return (
      currencies.find((currency) => currency.code === currencyCode)?.symbol || "$"
    );
  }
  
  export function getCurrencyLabel(currencyCode: string | null | undefined) {
    return (
      currencies.find((currency) => currency.code === currencyCode)?.label ||
      "US Dollar"
    );
  }
  
  export function formatMoney(
    amount: number,
    currencyCode: string | null | undefined = "USD"
  ) {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol} ${Number(amount || 0).toLocaleString()}`;
  }