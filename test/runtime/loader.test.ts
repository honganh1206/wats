import assert from "node:assert";
import { compile } from "../../src/compiler/compile";
import { loadMod } from "../../src/runtime/loader";
import test from "node:test";
import { buildModule } from "../../src/wasm/module";
import { instr, valtype } from "../../src/wasm/instructions";
import { i32 } from "../../src/wasm/encoding";
import { funcidx, locals } from "../../src/wasm/sections";

test('compile bytes to WASM modules', () => {
  assert.equal(loadMod(compile('funk main() { let x = 42; x }')).main(), 42);
  assert.deepEqual(
    loadMod(compile('funk main() { let a = 13; let b = 15; a := 10; a + b }')).main(),
    25,
  );
})

test('buildModule with imports', () => {
  const importDecls = [
    {
      module: 'basicMath',
      name: 'addOne',
      paramTypes: [valtype.i32],
      resultType: valtype.i32,
      locals: [],
      body: [],
    },
  ];
  const functionDecls = [
    {
      module: 'main',
      name: 'main',
      paramTypes: [],
      resultType: valtype.i32,
      locals: [locals(1, valtype.i32)],
      body: [instr.call, funcidx(2), instr.end],
    },
    {
      module: 'main',
      name: 'backup',
      paramTypes: [],
      resultType: valtype.i32,
      locals: [],
      body: [instr.i32.const, i32(42), instr.call, funcidx(0), instr.end],
    },
  ];
  const imports = {
    basicMath: { addOne: (x: number) => x + 1 }
  };
  const exports = loadMod(buildModule(importDecls, functionDecls), imports);
  assert.strictEqual(exports.main(), 43);
})

test('module with multiple functions', () => {
  assert.deepEqual(
    loadMod(compile('funk main() { let x = 42; x }')).main(),
    42,
  );
  assert.deepEqual(
    loadMod(
      compile('funk doIt() { add(1, 2) } funk add(x, y) { x + y }'),
    ).doIt(),
    3,
  );
})


test('module with imports', () => {
  const imports = {
    watsImports: {
      add: (a: number, b: number) => a + b,
      one: () => 1,
    },
  };
  const compileAndEval = (src: string) => {
    return loadMod(compile(src), imports).main();
  }

  // Code without import still works
  assert.strictEqual(compileAndEval(`funk main() { 2 + 2 }`), 4);

  assert.strictEqual(compileAndEval(
    `extern funk add(a, b);
     funk main() {
      let a = 42;
      add(a, 1)
     }`
  ), 43);

  assert.strictEqual(compileAndEval(
    `extern funk add(a, b);
      extern funk one();
      funk main() {
        let a = 42;
        add(a, one())
      }`
  ), 43);
});

test('Wats if expressions', () => {
  let mod = loadMod(compile('funk choose(x) { if x { 42 } else { 43 } }'));
  assert.strictEqual(mod.choose(1), 42);
  assert.strictEqual(mod.choose(0), 43);

  mod = loadMod(
    compile(`
      funk isZero(x) {
        let result = if x { 0 } else { 1 };
        result
      }
    `)
  )
  assert.strictEqual(mod.isZero(1), 0);
  assert.strictEqual(mod.isZero(0), 1);
})

test('Wats comparison operators', () => {
  const mod = loadMod(
    compile(`
      funk greaterThan(a, b) { a > b }
      funk lessThan(a, b) { a < b }
      funk greaterThanOrEq(a, b) { a >= b }
      funk lessThanOrEq(a, b) { a <= b }
      funk eq(a, b) { a == b }
      funk and_(a, b) { a & b }
      funk or_(a, b) { a | b }
`),
  );
  assert.strictEqual(mod.greaterThan(43, 42), 1);
  assert.strictEqual(mod.greaterThan(42, 43), 0);
  assert.strictEqual(mod.lessThan(43, 42), 0);
  assert.strictEqual(mod.greaterThanOrEq(42, 42), 1);
  assert.strictEqual(mod.lessThanOrEq(42, 43), 1);
  assert.strictEqual(mod.eq(42, 42), 1);
  assert.strictEqual(mod.and_(1, 1), 1);
  assert.strictEqual(mod.and_(1, 0), 0);
  assert.strictEqual(mod.or_(1, 0), 1);
  assert.strictEqual(mod.or_(0, 1), 1);
})

test('Wats while loops', () => {
  const mod = loadMod(
    compile(`
      funk countTo(n) {
        let x = 0;
        while x < n {
          x := x + 1;
        }
        x
      }
    `)
  )

  assert.strictEqual(mod.countTo(10), 10);
})

test('Wats conditionals, comparisons, and loops', () => {
  const mod = loadMod(
    compile(`
      funk countTo(n) {
        let x = 0;
        while x < n {
          if x < 60 { x := x + 1; }
        }
        x
      }

      funk compare(a, b) {
        if a < b { 0 - 1 } else if a > b { 1 } else { 0 }
      }
`),
  );
  assert.strictEqual(mod.countTo(10), 10);
  assert.strictEqual(mod.countTo(-1), 0);
  assert.strictEqual(mod.compare(1, 2), -1);
  assert.strictEqual(mod.compare(42, 2), 1);
  assert.strictEqual(mod.compare(42, 42), 0);
});
