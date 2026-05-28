import { parser } from "./grammar";
import { buildSymbolTable } from "./symbol";
import { defineFunctionDecls, defineImportDecls, defineToWasm } from "./semantics";
import { buildModule } from "../wasm/module";
import { prelude } from "../runtime/prelude";
import { buildStringTable } from "./strings";
import { DataSegment, int32ToBytes } from "../wasm/encoding";

export function compile(src: string): Uint8Array<ArrayBuffer> {
  const matchResult = parser.match(prelude + src);
  if (matchResult.failed()) {
    // NOTE: Type narrowing from MatchResult to FailedMatchResult
    throw new Error(matchResult.message);
  }

  // NOTE: Discard at the end of the function?
  const semantics = parser.createSemantics();

  // Top-level symbol table with a single key 'Main'
  const symbolTable = buildSymbolTable(parser, matchResult);
  const stringTable = buildStringTable(parser, matchResult);
  defineToWasm(semantics, symbolTable, stringTable);
  defineImportDecls(semantics);
  defineFunctionDecls(semantics, symbolTable);

  const importDecls = semantics(matchResult).importDecls();
  // Visit all top-level function declarations,
  // and return an object for each declaration
  const funcDecls = semantics(matchResult).functionDecls();
  const heapBase = stringTable.data.length;
  const dataSegs: DataSegment[] = [
    { offset: 0, bytes: stringTable.data },
    { offset: heapBase, bytes: int32ToBytes(heapBase + 4) },
  ];
  return buildModule(importDecls, funcDecls, dataSegs);
}

