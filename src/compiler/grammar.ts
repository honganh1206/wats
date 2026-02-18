import { grammar } from "ohm-js";

export const grammarDef = `
  WatsLang {
    // Digits can be repeated one or more times
    Main = number
    number = digit+
  }

  // Examples:
  //+ "42", "1"
  //- "abc"
`
export const parser = grammar(grammarDef);

