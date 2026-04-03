# Variable-Length Integer Encoding

LEB128 is a *scheme* for encoding arbitrarily-sized integers, *using only as many bytes as required*. 

## JS Numbers vs. WASM Numbers

JS has `Number` type that represents both integers and floating point numbers.

`Number` uses 64-bit IEEE 754 float as its underlying representation, but it cannot represent all 64-bit integers.

```bash
node
> Number.MAX_SAFE_INTEGER.toString(2).length
# Largest safe integer representable with JS Number type is a 53-bit integer.
> 53
```

WASM's largest integer is `i64`, and in JS we can use `BigInt` to represent that.

```bash
# Use n after any integer literal for BigInt
> 2n ** 64n
18446744073709551616n
```

We need to process the input 7 bits at a time.

We use `>>` to shift the input 7 bits to the right, discarding those we already encoded. We continue doing so until all remaining bits are 0.
