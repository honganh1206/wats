import assert from "node:assert";
import { compile } from "../../src/compiler/compile";
import { loadMod } from "../../src/runtime/loader";
import test from "node:test";
import { buildModule, FunctionDeclaration } from "../../src/wasm/module";
import { instr, valtype } from "../../src/wasm/instructions";
import { DataSegment, i32 } from "../../src/wasm/encoding";
import { funcidx, locals, memarg, memidx } from "../../src/wasm/sections";

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
  const exports = loadMod(buildModule(importDecls, functionDecls, []), imports);
  assert.strictEqual(exports.main(), 43);
})


test('buildModule with memory', () => {
  const importDecls: FunctionDeclaration[] = [];
  const functionDecls: FunctionDeclaration[] = [
    {
      module: 'main',
      name: 'main',
      paramTypes: [],
      resultType: valtype.i32,
      locals: [],
      body: [
        [instr.i32.const, i32(40), [instr.memory.grow, memidx(0)]],
        [instr.memory.size, memidx(0)],
        instr.i32.add,
        instr.end,
      ],
    },
  ];
  const imports = {};
  const exports = loadMod(buildModule(importDecls, functionDecls, []), imports);
  // Export a WebAssembly.Memory instance
  assert.ok(exports.$watsMemory);
  assert.strictEqual(exports.main(), 42);

  const PAGE_SIZE_IN_BYTES = 64 * 1024;
  assert.strictEqual(
    exports.$watsMemory.buffer.byteLength,
    PAGE_SIZE_IN_BYTES * 41,
  );
});

test('load from memory and store to memory', () => {
  const importDecls: FunctionDeclaration[] = [];
  const functionDecls: FunctionDeclaration[] = [
    {
      module: 'main',
      name: 'main',
      paramTypes: [],
      resultType: valtype.i32,
      locals: [],
      body: [
        [instr.i32.const, i32(4)], // Address of value
        [instr.i32.const, i32(42)], // Value
        [instr.i32.store, memarg(0, 0)], // Store value at address + 0
        [instr.i32.const, i32(4)],
        [instr.i32.load, memarg(0, 0)],
        instr.end,
      ],
    }
  ];
  const exports = loadMod(buildModule(importDecls, functionDecls, []), {});
  assert.equal(exports.main(), 42);

  // Verify contents of exported memory as little-endian
  const view = new DataView(exports.$watsMemory.buffer);
  // Get the 32-bit integer at offset 4
  assert.equal(view.getInt32(4, true), 42);
});

test('raw memory access', () => {
  const src = `
    funk write() {
      let offset = 0;
      while offset < 256 {
        __mem[offset] := 1;
        // i32 so we set 4 bytes for a new value
        offset := offset + 4;
      }
      0
    }

    // Sum of all values in memory
    funk sum() {
      let offset = 0;
      let sum = 0;
      while offset < 256 {
        sum := sum + __mem[offset];
        offset := offset + 4;
      }
      sum
    }
  `;

  const mod = loadMod(compile(src), {});
  mod.write();
  // TODO: Why is sum equal to 64 here?
  assert.strictEqual(mod.sum(), 64);

  // Read exported memory directly
  const view = new DataView(mod.$watsMemory.buffer);
  let sum = 0;
  for (let offset = 0; offset < 256; offset += 4) {
    // Read in little-endian
    // Each value occupies 4 bytes, so we have 256/4=64 iterations
    // and since we set all values of the __mem array as 1
    // the total value should be 64
    sum += view.getInt32(offset, true);
  }
  assert.strictEqual(sum, 64);
});

test('module with multiple functions', () => {
  assert.deepEqual(
    loadMod(compile('funk main() { let x = 42; x }'), {}).main(),
    42,
  );
  assert.deepEqual(
    loadMod(
      compile('funk doIt() { add(1, 2) } funk add(x, y) { x + y }'),
      {},
    ).doIt(),
    3,
  );
});

test('unaligned memory access', () => {
  const src = `
    funk unalignedStoreAndLoad() {
      __mem[1] := 42;
      // Should return 2a,00,00,00
      __mem[1]
    }

    funk unalignedStoreAlignedLoad() {
      __mem[1] := 42;
      // Should return 00,2a,00,00
      __mem[0]
    }

  `
  const mod = loadMod(compile(src), {});
  assert.strictEqual(mod.unalignedStoreAndLoad(), 0x2a); // 0x2a = 42
  // Extra 4 bytes for heap bookeeping
  assert.strictEqual(mod.unalignedStoreAlignedLoad(), 0x2a04);
});


test('i32 arrays', () => {
  const src = `
    funk write(arr, len) {
      // Write value 1 to 64 entries of arr?
      let idx = 0;
      while idx < len {
        arr[idx] := 1;
        idx := idx + 1;
      }
      0
    }

    funk sum(arr, len) {
      let idx = 0;
      let sum = 0;
      while idx < len {
        sum := sum + arr[idx];
        idx := idx + 1;
      }
      sum
    }
  `;

  const mod = loadMod(compile(src), {});
  const arr = mod.newInt32Array(64);
  assert.strictEqual(mod.sum(arr, 64), 0);
  mod.write(arr, 64);
  assert.strictEqual(mod.sum(arr, 64), 64);
});

test('bounds checking', () => {
  const src = `
    funk main() {
      let arr = newInt32Array(1);
      arr[0] := 42;
      arr[1] := 99
    }
  `;
  const mod = loadMod(compile(src), {});
  assert.throws(() => mod.main(), /Unreachable/);
});

test('buildModule with data section', async () => {
  const segs: DataSegment[] = [
    { offset: 1, bytes: [0xab] },
    { offset: 2, bytes: [0x12, 0x34] },
  ];
  const exports = loadMod(buildModule([], [], segs), {});
  const mem = new DataView(exports.$watsMemory.buffer);
  assert.strictEqual(mem.getUint8(0), 0x00);
  assert.strictEqual(mem.getUint8(1), 0xab);
  assert.strictEqual(mem.getUint8(2), 0x12);
  assert.strictEqual(mem.getUint8(3), 0x34);
})

test('strings', () => {
  const src = `
    funk main() {
      let s = "hey";
      let arr = newInt32Array(1);
      arr[0] := 42;
      s
    }
  `;
  const exports = loadMod(compile(src), {});
  exports.main();

  const view = new DataView(exports.$watsMemory.buffer);
  const memInt32At = (idx: number) => view.getUint32(idx * 4, true);

  assert.strictEqual(memInt32At(0), 'hey'.length);
  assert.strictEqual(memInt32At(1), 'hey'.charCodeAt(0));
  assert.strictEqual(memInt32At(2), 'hey'.charCodeAt(1));
  assert.strictEqual(memInt32At(3), 'hey'.charCodeAt(2));
});

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
`), {}
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
    `), {}
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
`), {}
  );
  assert.strictEqual(mod.countTo(10), 10);
  assert.strictEqual(mod.countTo(-1), 0);
  assert.strictEqual(mod.compare(1, 2), -1);
  assert.strictEqual(mod.compare(42, 2), 1);
  assert.strictEqual(mod.compare(42, 42), 0);
});
