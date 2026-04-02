import { parser } from "./grammar";
import { buildSymbolTable } from "./symbol";
import { defineFunctionDecls, defineToWasm } from "./semantics";
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

  defineFunctionDecls(semantics, st);
  // Visit all top-level func decls,
  // and return an object for each decl
  const funcDecls = semantics(matchResult).functionDecls();
  return buildModule(funcDecls)
}

