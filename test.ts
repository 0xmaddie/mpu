import {
  assert,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";

import {
  Matrix,
  MatrixBuffer,
  MatrixRuntime,
} from "./mod.ts";

type MatrixData =
  { shape: [number, number];
    buffer: number[]; }

type Example =
  | { operator: "add";
      fst: MatrixData;
      snd: MatrixData;
      expected: MatrixData; }
  | { operator: "mul";
      fst: MatrixData;
      snd: MatrixData;
      expected: MatrixData; }
  | { operator: "point";
      fst: MatrixData;
      snd: MatrixData;
      expected: MatrixData; }
  | { operator: "dual";
      src: MatrixData;
      expected: MatrixData; }
  | { operator: "relu";
      src: MatrixData;
      expected: MatrixData; }
  | { operator: "cos";
      src: MatrixData;
      expected: MatrixData; }
  | { operator: "sin";
      src: MatrixData;
      expected: MatrixData; }

Deno.test({
  name: "MatrixBuffer sanity check",
  fn: async (): Promise<void> => {
    const contents = await Deno.readTextFile("matrix_examples.json");
    const examples: Example[] = JSON.parse(contents);
    for (const example of examples) {
      switch (example.operator) {
        case "dual": {
          const src = new MatrixBuffer(
            example.src.shape,
            example.src.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.dual(src);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "relu": {
          const src = new MatrixBuffer(
            example.src.shape,
            example.src.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.relu(src);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "sin": {
          const src = new MatrixBuffer(
            example.src.shape,
            example.src.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.sin(src);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "cos": {
          const src = new MatrixBuffer(
            example.src.shape,
            example.src.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.cos(src);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "add": {
          const fst = new MatrixBuffer(
            example.fst.shape,
            example.fst.buffer,
          );
          const snd = new MatrixBuffer(
            example.snd.shape,
            example.snd.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.add(fst, snd);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "mul": {
          const fst = new MatrixBuffer(
            example.fst.shape,
            example.fst.buffer,
          );
          const snd = new MatrixBuffer(
            example.snd.shape,
            example.snd.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.mul(fst, snd);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "point": {
          const fst = new MatrixBuffer(
            example.fst.shape,
            example.fst.buffer,
          );
          const snd = new MatrixBuffer(
            example.snd.shape,
            example.snd.buffer,
          );
          const expected = new MatrixBuffer(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = new MatrixBuffer(example.expected.shape);
          actual.point(fst, snd);
          assert(actual.equals(expected), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
      }
    }
  },
});

/////

Deno.test({
  name: "Matrix sanity check",
  fn: async (): Promise<void> => {    
    const contents = await Deno.readTextFile("matrix_examples.json");
    const examples: Example[] = JSON.parse(contents);
    let ctx = new MatrixRuntime();
    ctx.acquire();
    for (const example of examples) {
      ctx.clear();
      switch (example.operator) {
        case "dual": {
          const src = Matrix.constant(
            example.src.shape,
            example.src.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = src.dual();
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "relu": {
          const src = Matrix.constant(
            example.src.shape,
            example.src.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = src.relu();
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "sin": {
          const src = Matrix.constant(
            example.src.shape,
            example.src.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = src.sin();
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "cos": {
          const src = Matrix.constant(
            example.src.shape,
            example.src.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = src.cos();
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "add": {
          const fst = Matrix.constant(
            example.fst.shape,
            example.fst.buffer,
          );
          const snd = Matrix.constant(
            example.snd.shape,
            example.snd.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = fst.add(snd);
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "mul": {
          const fst = Matrix.constant(
            example.fst.shape,
            example.fst.buffer,
          );
          const snd = Matrix.constant(
            example.snd.shape,
            example.snd.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = fst.mul(snd);
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
fst: ${fst.buffer}
snd: ${snd.buffer}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
        case "point": {
          const fst = Matrix.constant(
            example.fst.shape,
            example.fst.buffer,
          );
          const snd = Matrix.constant(
            example.snd.shape,
            example.snd.buffer,
          );
          const expected = Matrix.constant(
            example.expected.shape,
            example.expected.buffer,
          );
          const actual = fst.point(snd);
          ctx.execute();
          assert(actual.buffer.equals(expected.buffer), `
operator: ${example.operator}
expected: ${expected.buffer}
actual: ${actual.buffer}`);
          break;
        }
      }
    }
  },
});
