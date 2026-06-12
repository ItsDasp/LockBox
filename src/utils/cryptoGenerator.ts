export interface GeneratorOptions {
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  mode: "random" | "leet";
  baseText: string;
  extraChars: number;
}

const leetMap: Record<string, string> = {
  a: "4", A: "4", e: "3", E: "3", i: "1", I: "1",
  o: "0", O: "0", s: "5", S: "5", t: "7", T: "7",
  g: "9", G: "9", b: "8", B: "8"
};

const symbolMap: Record<string, string> = {
  a: "@", A: "@", i: "!", I: "!", s: "$", S: "$",
};

export const generateSecurePassword = (options: GeneratorOptions): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let pool = "";
  if (options.includeUppercase) pool += uppercase;
  if (options.includeLowercase) pool += lowercase;
  if (options.includeNumbers) pool += numbers;
  if (options.includeSymbols) pool += symbols;

  if (pool === "") return "";

  if (options.mode === "random") {
    const randomValues = new Uint32Array(options.extraChars);
    window.crypto.getRandomValues(randomValues);
    let generated = "";
    for (let i = 0; i < options.extraChars; i++) {
      generated += pool.charAt(randomValues[i] % pool.length);
    }
    return generated;
  }

  if (options.mode === "leet") {
    if (!options.baseText.trim()) return "";

    const transformedWord = options.baseText.split("").map((char) => {
      let transformed = char;
      if (options.includeNumbers && leetMap[transformed]) transformed = leetMap[transformed];
      if (options.includeSymbols && symbolMap[transformed]) transformed = symbolMap[transformed];
      if (!options.includeUppercase) transformed = transformed.toLowerCase();
      if (!options.includeLowercase) transformed = transformed.toUpperCase();
      return transformed;
    }).join("");

    if (options.extraChars <= 0) return transformedWord;

    const halfExtra = Math.floor(options.extraChars / 2);
    const restExtra = options.extraChars - halfExtra;

    const randomValues = new Uint32Array(options.extraChars);
    window.crypto.getRandomValues(randomValues);

    let prefix = "";
    for (let i = 0; i < halfExtra; i++) {
      prefix += pool.charAt(randomValues[i] % pool.length);
    }

    let suffix = "";
    for (let i = halfExtra; i < options.extraChars; i++) {
      suffix += pool.charAt(randomValues[i] % pool.length);
    }

    return `${prefix}${transformedWord}${suffix}`;
  }

  return "";
};