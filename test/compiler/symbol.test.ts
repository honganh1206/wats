import test from "node:test";
import { parser } from "../../src/compiler/grammar";
import { buildSymbolTable, resolveSymbol } from "../../src/compiler/symbol.ts";
import assert from "node:assert";
import { Node } from "ohm-js";

test(' build symbol table', () => {
  const getVarNames = (str: string) => {
    const symbolTable = buildSymbolTable(parser, parser.match(str));
    // Ensure var is not undefined
    const localVars = symbolTable.get('main');
    assert.ok(localVars);
    return Array.from(localVars.keys());
  };

  assert.deepEqual(getVarNames('funk main() { 42 }'), []);
  assert.deepEqual(getVarNames('funk main() { let x = 0; 42 }'), ['x']);
  assert.deepEqual(getVarNames(' funk main() { let x = 0; let y = 1; 42 }'), ['x', 'y']);
});

test('resolve symbol table', () => {
  const symbolTable = buildSymbolTable(parser, parser.match('funk main() { let x = 0; let y = 1; 42 }'));

  const localVars = symbolTable.get('main');
  assert.ok(localVars);
  assert.strictEqual(resolveSymbol({ sourceString: 'x' } as Node, localVars).idx, 0);
  assert.strictEqual(resolveSymbol({ sourceString: 'y' } as Node, localVars).idx, 1);
  assert.throws(() => resolveSymbol({ sourceString: 'z' } as Node, localVars));
});
