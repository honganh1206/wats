import test from "node:test";
import { parser } from "../../src/compiler/grammar";
import { buildSymbolTable, resolveSymbol } from "../../src/compiler/symbol.ts";
import assert from "node:assert";
import { Node } from "ohm-js";

test('symbol table', () => {
  const getVarNames = (str: string) => {
    const symbols = buildSymbolTable(parser, parser.match(str));
    // Ensure var is not undefined
    const localVars = symbols.get('main');
    assert.ok(localVars);
    return Array.from(localVars.keys());
  };

  assert.deepEqual(getVarNames('42'), []);
  assert.deepEqual(getVarNames('let x = 0; 42'), ['x']);
  assert.deepEqual(getVarNames('let x = 0; let y = 1; 42'), ['x', 'y']);

  const symbols = buildSymbolTable(parser, parser.match('let x = 0; let y = 1; 42'));

  const localVars = symbols.get('main');
  assert.ok(localVars);
  assert.strictEqual(resolveSymbol({ sourceString: 'x' } as Node, localVars).idx, 0);
  assert.strictEqual(resolveSymbol({ sourceString: 'y' } as Node, localVars).idx, 1);
  assert.throws(() => resolveSymbol({ sourceString: 'z' } as Node, localVars));
})
