import {
  Shape,
  ShapeLike,
} from "./shape.ts";

export type BufferLike = number[] | Float64Array;

export class MatrixBuffer {
  shape: Shape;
  buffer: Float64Array;

  constructor(
    shape: ShapeLike,
    buffer?: BufferLike,
  ) {
    if (shape instanceof Shape) {
      this.shape = shape;
    } else {
      this.shape = new Shape(shape[0], shape[1]);
    }
    if (buffer) {
      this.buffer = new Float64Array(buffer);
    } else {
      this.buffer = new Float64Array(this.capacity);
    }
  }

  get height(): number {
    return this.shape.height;
  }

  get width(): number {
    return this.shape.width;
  }

  get capacity(): number {
    return this.shape.capacity;
  }

  zero(): void {
    for (let i = 0; i < this.capacity; ++i) {
      this.buffer[i] = 0;
    }
  }

  one(): void {
    for (let i = 0; i < this.capacity; ++i) {
      this.buffer[i] = 1;
    }
  }

  set(values: BufferLike): void {
    for (let i = 0; i < values.length; ++i) {
      this.buffer[i] = values[i];
    }
  }

  randomUniform(min: number, max: number): void {
    const delta = max - min;
    for (let i = 0; i < this.capacity; ++i) {
      this.buffer[i] = min + Math.random() * delta;
    }
  }

  dual(src: MatrixBuffer): void {
    if (this.height !== src.width || this.width !== src.height) {
      throw new ShapeError("dual", this, src);
    }
    for (let row = 0; row < this.height; ++row) {
      for (let col = 0; col < this.width; ++col) {
        this.buffer[row * this.width + col] = src.buffer[col * src.width + row];
      }
    }
  }

  relu(src: MatrixBuffer): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("relu", this, src);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      this.buffer[i] = src.buffer[i] > 0 ? src.buffer[i] : 0;
    }
  }

  cos(src: MatrixBuffer): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("cos", this, src);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      this.buffer[i] = Math.cos(src.buffer[i]);
    }
  }

  sin(src: MatrixBuffer): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("sin", this, src);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      this.buffer[i] = Math.sin(src.buffer[i]);
    }
  }

  cis(src: MatrixBuffer): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("cis", this, src);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      if ((i % 2) === 0) {
        this.buffer[i] = Math.cos(src.buffer[i]);
      } else {
        this.buffer[i] = Math.sin(src.buffer[i]);
      }
    }
  }

  sic(src: MatrixBuffer): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("sic", this, src);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      if ((i % 2) === 0) {
        this.buffer[i] = Math.sin(src.buffer[i]);
      } else {
        this.buffer[i] = Math.cos(src.buffer[i]);
      }
    }
  }

  add(fst: MatrixBuffer, snd: MatrixBuffer): void {
    if (
      !(this.shape.equals(fst.shape)) ||
      !(this.shape.equals(snd.shape))
    ) {
      throw new ShapeError("add", this, fst, snd);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      this.buffer[i] = fst.buffer[i] + snd.buffer[i];
    }
  }

  mul(fst: MatrixBuffer, snd: MatrixBuffer): void {
    if (
      this.height !== fst.height ||
      this.width !== snd.width ||
      fst.width !== snd.height
    ) {
      throw new ShapeError("mul", this, fst, snd);
    }
    for (let row = 0; row < fst.height; ++row) {
      for (let dot = 0; dot < fst.width; ++dot) {
        const lhs = fst.buffer[row * fst.width + dot];
        for (let col = 0; col < snd.width; ++col) {
          const rhs = snd.buffer[dot * snd.width + col];
          this.buffer[row * this.width + col] += lhs * rhs;
        }
      }
    }
  }

  point(fst: MatrixBuffer, snd: MatrixBuffer): void {
    if (
      !(this.shape.equals(fst.shape)) ||
      !(this.shape.equals(snd.shape))
    ) {
      throw new ShapeError("point", this, fst, snd);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      this.buffer[i] = fst.buffer[i] * snd.buffer[i];
    }
  }

  sumk(src: MatrixBuffer, k: number): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("sumk", this, src);
    }
    for (let row = 0; row < this.height; ++row) {
      let sum = 0;
      for (let col = 0; col < this.width; ++col) {
        sum += src.buffer[row*this.width+col];
      }
      for (let col = 0; col < this.width; ++col) {
        if (col === k) {
          this.buffer[row*this.width+col] = sum;
        } else {
          this.buffer[row*this.width+col] = 0;
        }
      }
    }
  }

  equals(rhs: MatrixBuffer): boolean {
    if (this.height !== rhs.height || this.width !== rhs.width) {
      return false;
    }
    const epsilon = 1e-4;
    for (let i = 0; i < this.capacity; ++i) {
      const delta = Math.abs(this.buffer[i] - rhs.buffer[i]);
      if (delta > epsilon) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return `${this.shape} ${this.buffer}`;
  }
}

export class ShapeError {
  tag: "circuit.shape-error" = "circuit.shape-error";
  operator: string;
  buffer: MatrixBuffer[];

  constructor(
    operator: string,
    ...buffer: MatrixBuffer[]
  ) {
    this.operator = operator;
    this.buffer = buffer;
  }

  toString(): string {
    const shapes = this.buffer.map((x) => x.shape);
    return `Invalid shapes for operator ${this.operator} @ ${shapes}`;
  }
}
