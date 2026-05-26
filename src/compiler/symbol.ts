import { Grammar, MatchResult, Node } from "ohm-js";

export type Scope = {
  // Variable bindings
  locals: Map<string, Symbol>;
  // Nested function scopes
  children: Map<string, Scope>;
};

export type Symbol = {
  name: string;
  idx: number;
  what: 'local' | 'param';
};

// Map function name to local symbol table
// and return the first Scope as the symbol table
export function buildSymbolTable(parser: Grammar, matchResult: MatchResult): Scope {
  // We have a separate instance of semantics here
  // since there might be a case where toWasm() gets invoked before buildSymbolTable()
  // leading to a runtime crash
  const tempSemantics = parser.createSemantics();
  const scopes: [Scope] = [{ locals: new Map<string, Symbol>(), children: new Map<string, Scope>() }];
  tempSemantics.addOperation('buildSymbolTable', {
    // Single, generic action
    // in case there is no matching action.
    _default(...children) {
      // Recursively visit all LetStmt in the tree
      return children.forEach((c) => c.buildSymbolTable());
    },
    LetStmt(_let, id, _eq, _expr, _) {
      // Add a variable to the current scope
      const name = id.sourceString;
      const idx = scopes.at(-1).locals.size;
      const info: Symbol = { name, idx, what: 'local' };
      scopes.at(-1).locals.set(name, info);
    },
    ExternFunctionDecl(_extern, _func, ident, _l, optParams, _r, _) {
      const name = ident.sourceString;
      const childScope: Scope = {
        locals: new Map<string, Symbol>(),
        children: new Map<string, Scope>(),
        // Init top-level symbol table
      };
      scopes.at(-1).children.set(name, childScope);
    },
    FunctionDecl(_func, ident, _lparen, optParams, _rparen, blockExpr) {
      const name = ident.sourceString;
      const childScope: Scope = {
        locals: new Map<string, Symbol>(),
        children: new Map<string, Scope>(),
      };
      scopes.at(-1).children.set(name, childScope);
      scopes.push(childScope);
      optParams.child(0)?.buildSymbolTable();
      blockExpr.buildSymbolTable();
      scopes.pop();
    },
    AssignmentExpr_array(_id, _lbracket, _idx, _rbracket, _, _expr) {
      // Create a temp var to store the array's values in?
      const name = '$temp';
      if (!scopes.at(-1).locals.has(name)) {
        const idx = scopes.at(-1).locals.size;
        const info: Symbol = { name, idx, what: 'local' };
        scopes.at(-1).locals.set(name, info);
      }
    },
    // Treat params as local vars
    Params(ident, _, iterIdent) {
      for (const id of [ident, ...iterIdent.children]) {
        const name = id.sourceString;
        const idx = scopes.at(-1).locals.size;
        const info: Symbol = { name, idx, what: 'param' };
        scopes.at(-1).locals.set(name, info);
      }
    }
  });
  tempSemantics(matchResult).buildSymbolTable();
  return scopes[0];
}

export function resolveSymbol(identNode: Node, scope: Scope): Symbol {
  const identName = identNode.sourceString;
  if (scope.locals.has(identName)) {
    return scope.locals.get(identName);
  }
  throw new Error(`Error: undeclared identifier '${identName}'`);
}
