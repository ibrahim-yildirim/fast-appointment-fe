// ı and İ don't decompose to a plain i, so NFD alone would drop or mangle them.
const turkishLetters: Record<string, string> = {
  ı: "i",
  İ: "i",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ş: "s",
  Ş: "s",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
}

export function slugify(value: string) {
  return value
    .replace(/[ıİğĞüÜşŞöÖçÇ]/g, (letter) => turkishLetters[letter])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
