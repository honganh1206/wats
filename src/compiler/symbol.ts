import { Grammar, MatchResult, Node } from "ohm-js";

export type SymbolTable = Map<string, Scope>;

export type Scope = Map<string, Symbol>;

type Symbol = {
  name: string;
  idx: number;
  // TODO: Could be union type?
  what: 'local';
};

// Map function name to local symbol table
export function buildSymbolTable(parser: Grammar, matchResult: MatchResult): SymbolTable {
  // NOTE: We have a separate instance of semantics here
  // since ther might be a case where toWasm() gets invoked before buildSymbolTable()
  // which can lead to a runtime crash
  // since toWasm() tries to look up a variable that has not been registered yet
  // TODO: See if we can reuse the same semantics instance
  // and make sure the ordering go right instead.
  const tempSemantics = parser.createSemantics();
  const symbols: SymbolTable = new Map<string, Scope>();
  symbols.set('main', new Map<string, Symbol>());
  tempSemantics.addOperation('buildSymbolTable', {
    // Single, generic action
    // in case there is no matching action.
    _default(...children) {
      // Ensure we visit all LetStmt in the tree
      return children.forEach((c) => c.buildSymbolTable());
    },
    LetStmt(_let, id, _eq, _expr, _) {
      const name = id.sourceString;
      const idx = symbols.get('main').size;
      const info: Symbol = { name, idx, what: 'local' };
      symbols.get('main').set(name, info);
    },
  });
  tempSemantics(matchResult).buildSymbolTable();
  return symbols;
}

export function resolveSymbol(identNode: Node, scope: Scope): Symbol {
  const identName = identNode.sourceString;
  if (scope.has(identName)) {
    return scope.get(identName);
  }
  throw new Error(`Error: undeclared identifier '${identName}'`);
}
