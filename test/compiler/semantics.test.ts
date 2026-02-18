import test from "node:test";
import { semantics } from "../../src/compiler/semantics"
import { parser } from "../../src/compiler/grammar";
import assert from "node:assert";

const sem = (input: string) => semantics(parser.match(input));

test('jsValue', () => {
  assert.equal(sem('42').jsValue(), 42);
  assert.equal(sem('0').jsValue(), 0);
  assert.equal(sem('99').jsValue(), 99);
})

test('toWasm', () => {
  assert.deepStrictEqual(sem('42').toWasm(), [[0x41, 42], 0x0b]);
  assert.deepStrictEqual(sem('0').toWasm(), [[0x41, 0], 0x0b]);
})
