# Minimum Viable Compiler

## Handling binary data in JS/TS

```js
const arr = new Uint8Array(2); // An array of two bytes.
arr[0] = 5;
arr[1] = 7;
console.log(arr[0] + arr[1]); // Prints '12'
```

Hexadecimal: A byte can be represented by two characters from 0 (`00`) to 255 (`ff`)

