import assert from 'node:assert';
import { test } from 'node:test';
import { VERSION } from '../src/index';

test('smoke', () => { assert.strictEqual(VERSION, 1); });
