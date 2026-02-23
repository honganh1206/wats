import { createInterface } from "node:readline/promises";
import { compile } from "./compiler/compile";
import { loadMod } from "./runtime/loader";

(async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("wats REPL — type an expression, or .exit to quit");

  while (true) {
    const line = await rl.question("> ");
    if (line.trim() === ".exit") break;
    try {
      const mod = loadMod(compile(line));
      const result = mod.main(0);
      console.log(result);
    } catch (e: any) {
      console.error(e.message);
    }
  }

  rl.close();
})();
