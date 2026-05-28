<script lang="ts">
  import { onMount } from "svelte";
  import { runWats, type RunResult } from "$lib/wats";

  const STORAGE_KEY = "wats-playground-src";
  const SEED = `funk fib(n) {
  let prev = 0;
  let curr = 1;
  let idx = 0;

  while idx < n {
    let next = prev + curr;
    prev := curr;
    curr := next;
    idx := idx + 1;
  }

  prev
}

funk main() {
  let title = "wats";
  let values = newInt32Array(4);
  let idx = 0;
  let total = 0;

  while idx < 4 {
    values[idx] := fib(idx + one());
    total := add(total, values[idx]);
    idx := idx + 1;
  }

  let ok = total >= 7 & total != 0;
  let result = if ok { total } else { 0 };

  print(title);
  print(result)
}
`;
  const BUILT_INS = [
    {
      call: "add(a, b)",
      result: "returns a + b",
    },
    {
      call: "one()",
      result: "returns 1",
    },
    {
      call: "print(x)",
      result: "prints x and returns x",
    },
  ];

  let src = $state(SEED);
  let result = $state<RunResult | null>(null);
  let textarea: HTMLTextAreaElement | undefined;

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) src = saved;
  });

  $effect(() => {
    localStorage.setItem(STORAGE_KEY, src);
  });

  function run() {
    result = runWats(src);
  }

  function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
      return;
    }
    if (e.key === "Tab" && textarea) {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      src = src.slice(0, start) + "  " + src.slice(end);
      // restore caret after the inserted spaces
      queueMicrotask(() => {
        if (!textarea) return;
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }
</script>

<main>
  <header>
    <h1>wats playground</h1>
    <button onclick={run}>Run ▶</button>
  </header>

  <textarea
    bind:this={textarea}
    bind:value={src}
    spellcheck="false"
    autocomplete="off"
    autocapitalize="off"
    autocorrect="off"
    onkeydown={onKeydown}
    rows="20"
  ></textarea>

  <section class="builtins" aria-labelledby="builtins-title">
    <h2 id="builtins-title">Built-in Functions</h2>
    <div class="builtins-grid">
      {#each BUILT_INS as item}
        <div class="builtin-row">
          <span>{item.call}</span>
          <span>{item.result}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="output" aria-live="polite">
    <h2>Output</h2>
    {#if result === null}
      <pre class="muted">Press <kbd>Run</kbd> or <kbd>Ctrl/Cmd+Enter</kbd
        >.</pre>
    {:else if result.ok}
      <pre class="ok">{result.logs.length > 0 ? result.logs.join("\n") : String(result.result)}</pre>
    {:else}
      <pre class="err">{result.stage} error: {result.error}</pre>
    {/if}
  </section>

  <footer>
    <a
      href="https://github.com/honganh1206/wats"
      target="_blank"
      rel="noreferrer"
    >
      github.com/honganh1206/wats
    </a>
  </footer>
</main>

<style>
  :global(html, body) {
    margin: 0;
    background: #fafafa;
    color: #1a1a1a;
    font-family: system-ui, sans-serif;
  }

  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem 1rem 3rem;
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.25rem;
    margin: 0;
    font-weight: 600;
  }

  button {
    font: inherit;
    padding: 0.4rem 0.9rem;
    border: 1px solid #1a1a1a;
    background: #1a1a1a;
    color: #fafafa;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #333;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 14px;
    line-height: 1.5;
    tab-size: 2;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    color: #1a1a1a;
    resize: vertical;
  }

  textarea:focus {
    outline: 2px solid #1a1a1a;
    outline-offset: -1px;
  }

  .builtins,
  .output {
    margin-top: 1.5rem;
  }

  .builtins-grid {
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
  }

  .builtin-row {
    display: grid;
    grid-template-columns: minmax(7rem, 0.7fr) minmax(9rem, 1fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.65rem 0.75rem;
    border-top: 1px solid #e6e6e6;
    font-size: 14px;
  }

  .builtin-row:first-child {
    border-top: 0;
  }

  .builtin-row span {
    color: #555;
  }

  h2 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    margin: 0 0 0.5rem;
  }

  pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 14px;
    margin: 0;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: #fff;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .muted {
    color: #888;
  }

  .err {
    color: #b00020;
    border-color: #f3c2c8;
    background: #fff5f6;
  }

  kbd {
    font-family: ui-monospace, monospace;
    font-size: 0.85em;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 0 0.3em;
  }

  footer {
    margin-top: 2rem;
    font-size: 0.8rem;
    color: #888;
    text-align: center;
  }

  footer a {
    color: inherit;
  }

  @media (max-width: 720px) {
    .builtin-row {
      grid-template-columns: 1fr;
      gap: 0.3rem;
    }
  }
</style>
