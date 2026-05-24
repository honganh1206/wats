import { parser } from "./grammar";
import { buildSymbolTable } from "./symbol";
import { defineFunctionDecls, defineImportDecls, defineToWasm } from "./semantics";
import { buildModule } from "../wasm/module";

export function compile(src: string): Uint8Array<ArrayBuffer> {
  const matchResult = parser.match(src);
  if (matchResult.failed()) {
    // NOTE: Type narrowing from MatchResult to FailedMatchResult
    throw new Error(matchResult.message);
  }

  // NOTE: Discard at the end of the function?
  const semantics = parser.createSemantics();

  // Top-level symbol table with a single key 'Main'
  const st = buildSymbolTable(parser, matchResult);
  defineToWasm(semantics, st);
  defineImportDecls(semantics);
  defineFunctionDecls(semantics, st);

  const importDecls = semantics(matchResult).importDecls();
  // Visit all top-level func decls,
  // and return an object for each decl
  const funcDecls = semantics(matchResult).functionDecls();
  return buildModule(importDecls, funcDecls)
}

