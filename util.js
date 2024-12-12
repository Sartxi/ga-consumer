const STYLE_SHEETS = {};

export const getSheet = async (url) => {
  if (STYLE_SHEETS[url]) return STYLE_SHEETS[url];
  const resp = await fetch(url);
  const text = await resp.text();
  const sheet = new CSSStyleSheet();
  sheet.replace(text);
  STYLE_SHEETS[url] = sheet;
  return sheet;
};
