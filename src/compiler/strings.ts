import { Grammar, MatchResult } from "ohm-js";
import { ByteArray, int32ToBytes } from "../wasm/encoding";

export type StringTable = {
  offsets: Map<string, number>;
  data: ByteArray[];
}

export function buildStringTable(grammar: Grammar, matchResult: MatchResult): StringTable {
  const sem = grammar.createSemantics();
  const table: StringTable = {
    offsets: new Map<string, number>(),
    data: [],
  }
  sem.addOperation('buildStringTable', {
    _default(...children) {
      return children.forEach((c) => c.buildStringTable());
    },
    stringLiteral(_lquote, chars, _rquote) {
      const str = chars.sourceString;
      const offset = table.data.length;
      table.offsets.set(str, offset);
      table.data.push(...stringLiteralBytes(str));
    },
  });
  sem(matchResult).buildStringTable();
  return table;
}

function stringLiteralBytes(str: string): ByteArray[] {
  const bytes = int32ToBytes(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes.push(...int32ToBytes(str.charCodeAt(i)));
  }
  if (bytes.length != (str.length + 1) * 4) {
    throw Error(str);
  }
  return bytes;
}

