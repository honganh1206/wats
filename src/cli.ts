#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { compile } from "./compiler/compile";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: wats <file.wats> [-o output.wasm]");
  process.exit(1);
}

const inputPath = args[0];
const outputIdx = args.indexOf("-o");
const outputPath =
  outputIdx !== -1 ? args[outputIdx + 1] : basename(inputPath, ".wats") + ".wasm";

const src = readFileSync(inputPath, "utf-8");
const bytes = compile(src);
writeFileSync(outputPath, bytes);
console.log(`Compiled ${inputPath} → ${outputPath} (${bytes.length} bytes)`);
