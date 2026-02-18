import assert from "node:assert";
import test from "node:test";

import { grammar } from "ohm-js";
import { extractExamples } from "ohm-js/extras";
import { grammarDef } from "../../src/compiler/grammar"

test('WatsLang grammar test', () => {
  testExtractedExamples(grammarDef);
})

function testExtractedExamples(src: string) {
  const grm = grammar(src);
  for (const ex of extractExamples(src)) {
    const result = grm.match(ex.example, ex.rule);
    assert.strictEqual(result.succeeded(), ex.shouldMatch, JSON.stringify(ex));
  }
}
