import {
  Shape,
  ShapeLike,
} from "./shape.ts";

import {
  MatrixBuffer,
  BufferLike,
} from "./buffer.ts";

let _runtime: MatrixRuntime | null = null;

export class Matrix {
  _shape: Shape;
  _uid: number;

  constructor(shape: ShapeLike, uid: number) {
    if (shape instanceof Shape) {
      this._shape = shape;
    } else {
      this._shape = new Shape(shape[0], shape[1]);
    }
    this._uid = uid;
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

  get shape(): Shape {
    return this._shape;
  }

  get uid(): number {
    return this._uid;
  }

  get buffer(): MatrixBuffer {
    if (_runtime) {
      return _runtime.buffer(this);
    }
    throw new RuntimeError("buffer", this);
  }

  dual(): Matrix {
    if (_runtime) {
      return _runtime.dual(this);
    }
    throw new RuntimeError("dual", this);
  }

  cos(): Matrix {
    if (_runtime) {
      return _runtime.cos(this);
    }
    throw new RuntimeError("cos", this);
  }

  sin(): Matrix {
    if (_runtime) {
      return _runtime.sin(this);
    }
    throw new RuntimeError("sin", this);
  }

  cis(): Matrix {
    if (_runtime) {
      return _runtime.cis(this);
    }
    throw new RuntimeError("cis", this);
  }

  sic(): Matrix {
    if (_runtime) {
      return _runtime.sic(this);
    }
    throw new RuntimeError("sic", this);
  }

  relu(): Matrix {
    if (_runtime) {
      return _runtime.relu(this);
    }
    throw new RuntimeError("relu", this);
  }

  sumk(k: number): Matrix {
    if (_runtime) {
      return _runtime.sumk(this, k);
    }
    throw new RuntimeError("sumk", this);
  }

  add(rhs: Matrix): Matrix {
    if (_runtime) {
      return _runtime.add(this, rhs);
    }
    throw new RuntimeError("add", this, rhs);
  }

  mul(rhs: Matrix): Matrix {
    if (_runtime) {
      return _runtime.mul(this, rhs);
    }
    throw new RuntimeError("mul", this, rhs);
  }

  point(rhs: Matrix): Matrix {
    if (_runtime) {
      return _runtime.point(this, rhs);
    }
    throw new RuntimeError("point", this, rhs);
  }

  toString(): string {
    return `${this.height} ${this.width} ob_matrix`;
  }

  static zero(shape: Shape): Matrix {
    if (_runtime) {
      return _runtime.zero(shape);
    }
    throw new RuntimeError("zero");
  }

  static one(shape: Shape): Matrix {
    if (_runtime) {
      return _runtime.one(shape);
    }
    throw new RuntimeError("one");
  }

  static constant(
    shape: ShapeLike,
    value: BufferLike,
  ): Matrix {
    if (_runtime) {
      return _runtime.constant(shape, value);
    }
    throw new RuntimeError("constant");
  }

  static randomUniform(
    shape: ShapeLike,
    min: number,
    max: number,
  ): Matrix {
    if (_runtime) {
      return _runtime.randomUniform(shape, min, max);
    }
    throw new RuntimeError("randomUniform");
  }
}

export type RunOperator =
  | { opcode: "zero"; dst: MatrixBuffer }
  | { opcode: "one"; dst: MatrixBuffer }
  | { opcode: "constant"; dst: MatrixBuffer; buffer: BufferLike; }
  | { opcode: "dual"; src: MatrixBuffer; dst: MatrixBuffer }
  | { opcode: "relu"; src: MatrixBuffer; dst: MatrixBuffer }
  | { opcode: "cos"; src: MatrixBuffer; dst: MatrixBuffer }
  | { opcode: "sin"; src: MatrixBuffer; dst: MatrixBuffer }
  | { opcode: "cis"; src: MatrixBuffer; dst: MatrixBuffer }
  | { opcode: "sic"; src: MatrixBuffer; dst: MatrixBuffer }
  | { opcode: "sumk"; src: MatrixBuffer; dst: MatrixBuffer; k: number }
  | { opcode: "randomUniform"; dst: MatrixBuffer; min: number; max: number }
  | { opcode: "add"; dst: MatrixBuffer; fst: MatrixBuffer; snd: MatrixBuffer }
  | { opcode: "mul"; dst: MatrixBuffer; fst: MatrixBuffer; snd: MatrixBuffer }
  | { opcode: "point";
      dst: MatrixBuffer;
      fst: MatrixBuffer;
      snd: MatrixBuffer; };

export class MatrixRuntime {
  code: RunOperator[];
  data: MatrixBuffer[];

  constructor() {
    this.code = [];
    this.data = [];
  }

  acquire(): void {
    if (!_runtime) {
      _runtime = this;
    } else {
      throw "MatrixRuntime#acquire: already acquired";
    }
  }

  release(): void {
    if (_runtime === this) {
      _runtime = null;
    } else {
      throw "MatrixRuntime#release: not acquired";
    }
  }

  clear(): void {
    this.code = [];
    this.data = [];
  }

  allocate(shape: ShapeLike): Matrix {
    const uid = this.data.length;
    const dst = new Matrix(shape, uid);
    const buf = new MatrixBuffer(shape);
    this.data.push(buf);
    return dst;
  }

  schedule(run: RunOperator): void {
    this.code.push(run);
  }

  buffer(pointer: Matrix): MatrixBuffer {
    return this.data[pointer.uid];
  }

  execute(): void {
    for (const inst of this.code) {
      switch (inst.opcode) {
        case "zero": {
          inst.dst.zero();
          break;
        }
        case "one": {
          inst.dst.one();
          break;
        }
        case "constant": {
          inst.dst.buffer.set(inst.buffer);
          break;
        }
        case "dual": {
          inst.dst.dual(inst.src);
          break;
        }
        case "relu": {
          inst.dst.relu(inst.src);
          break;
        }
        case "cos": {
          inst.dst.cos(inst.src);
          break;
        }
        case "sin": {
          inst.dst.sin(inst.src);
          break;
        }
        case "cis": {
          inst.dst.cis(inst.src);
          break;
        }
        case "sic": {
          inst.dst.sic(inst.src);
          break;
        }
        case "sumk": {
          inst.dst.sumk(inst.src, inst.k);
          break;
        }
        case "randomUniform": {
          inst.dst.randomUniform(inst.min, inst.max);
          break;
        }
        case "add": {
          inst.dst.add(inst.fst, inst.snd);
          break;
        }
        case "mul": {
          inst.dst.mul(inst.fst, inst.snd);
          break;
        }
        case "point": {
          inst.dst.point(inst.fst, inst.snd);
          break;
        }
      }
    }
  }

  zero(shape: ShapeLike): Matrix {
    const dst = this.allocate(shape);
    const run: RunOperator = {
      opcode: "zero",
      dst: this.buffer(dst),
    };
    this.schedule(run);
    return dst;
  }

  one(shape: ShapeLike): Matrix {
    const dst = this.allocate(shape);
    const run: RunOperator = {
      opcode: "one",
      dst: this.buffer(dst),
    };
    this.schedule(run);
    return dst;
  }

  constant(
    shape: ShapeLike,
    value: BufferLike,
  ): Matrix {
    const dst = this.allocate(shape);
    dst.buffer.buffer.set(value);
    return dst;
  }

  dual(src: Matrix): Matrix {
    const dst = this.allocate([src.width, src.height]);
    const run: RunOperator = {
      opcode: "dual",
      dst: this.buffer(dst),
      src: this.buffer(src),
    };
    this.schedule(run);
    return dst;
  }

  relu(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "relu",
      dst: this.buffer(dst),
      src: this.buffer(src),
    };
    this.schedule(run);
    return dst;
  }

  cos(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "cos",
      dst: this.buffer(dst),
      src: this.buffer(src),
    };
    this.schedule(run);
    return dst;
  }

  sin(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "sin",
      dst: this.buffer(dst),
      src: this.buffer(src),
    };
    this.schedule(run);
    return dst;
  }

  cis(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "cis",
      dst: this.buffer(dst),
      src: this.buffer(src),
    };
    this.schedule(run);
    return dst;
  }

  sic(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "sic",
      dst: this.buffer(dst),
      src: this.buffer(src),
    };
    this.schedule(run);
    return dst;
  }

  sumk(src: Matrix, k: number): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "sumk",
      dst: this.buffer(dst),
      src: this.buffer(src),
      k,
    };
    this.schedule(run);
    return dst;
  }

  randomUniform(
    shape: ShapeLike,
    min: number,
    max: number,
  ): Matrix {
    const dst = this.allocate(shape);
    const run: RunOperator = {
      opcode: "randomUniform",
      dst: this.buffer(dst),
      min,
      max,
    };
    this.schedule(run);
    return dst;
  }

  add(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const run: RunOperator = {
      opcode: "add",
      dst: this.buffer(dst),
      fst: this.buffer(fst),
      snd: this.buffer(snd),
    };
    this.schedule(run);
    return dst;
  }

  mul(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate([fst.height, snd.width]);
    const run: RunOperator = {
      opcode: "mul",
      dst: this.buffer(dst),
      fst: this.buffer(fst),
      snd: this.buffer(snd),
    };
    this.schedule(run);
    return dst;
  }

  point(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const run: RunOperator = {
      opcode: "point",
      dst: this.buffer(dst),
      fst: this.buffer(fst),
      snd: this.buffer(snd),
    };
    this.schedule(run);
    return dst;
  }
}

export class RuntimeError {
  operator: string;
  args: Matrix[];
  
  constructor(
    operator: string,
    ...args: Matrix[]
  ) {
    this.operator = operator;
    this.args = args;
  }

  toString(): string {
    return `Attempted to call operator ${this.operator} with no runtime present.`;
  }
}
