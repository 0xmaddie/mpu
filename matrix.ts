import {
  Shape,
  ShapeLike,
} from "./shape.ts";

import {
  MatrixBuffer,
  BufferLike,
} from "./buffer.ts";

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

  get asMatrix(): Matrix {
    return this;
  }

  toString(): string {
    return `${this.height} ${this.width} ob_matrix`;
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

export class Env {
  code: RunOperator[];
  data: MatrixBuffer[];

  constructor() {
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

  load(pointer: Matrix): MatrixBuffer {
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
      dst: this.load(dst),
    };
    this.schedule(run);
    return dst;
  }

  one(shape: ShapeLike): Matrix {
    const dst = this.allocate(shape);
    const run: RunOperator = {
      opcode: "one",
      dst: this.load(dst),
    };
    this.schedule(run);
    return dst;
  }

  constant(
    shape: ShapeLike,
    buffer: BufferLike,
  ): Matrix {
    const dst = this.allocate(shape);
    const run: RunOperator = {
      opcode: "constant",
      dst: this.load(dst),
      buffer,
    };
    this.schedule(run);
    return dst;
  }

  dual(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "dual",
      dst: this.load(dst),
      src: this.load(src),
    };
    this.schedule(run);
    return dst;
  }

  relu(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "relu",
      dst: this.load(dst),
      src: this.load(src),
    };
    this.schedule(run);
    return dst;
  }

  cos(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "cos",
      dst: this.load(dst),
      src: this.load(src),
    };
    this.schedule(run);
    return dst;
  }

  sin(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "sin",
      dst: this.load(dst),
      src: this.load(src),
    };
    this.schedule(run);
    return dst;
  }

  cis(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "cis",
      dst: this.load(dst),
      src: this.load(src),
    };
    this.schedule(run);
    return dst;
  }

  sic(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "sic",
      dst: this.load(dst),
      src: this.load(src),
    };
    this.schedule(run);
    return dst;
  }

  sumk(src: Matrix, k: number): Matrix {
    const dst = this.allocate(src.shape);
    const run: RunOperator = {
      opcode: "sumk",
      dst: this.load(dst),
      src: this.load(src),
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
      dst: this.load(dst),
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
      dst: this.load(dst),
      fst: this.load(fst),
      snd: this.load(snd),
    };
    this.schedule(run);
    return dst;
  }

  mul(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const run: RunOperator = {
      opcode: "mul",
      dst: this.load(dst),
      fst: this.load(fst),
      snd: this.load(snd),
    };
    this.schedule(run);
    return dst;
  }

  point(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const run: RunOperator = {
      opcode: "point",
      dst: this.load(dst),
      fst: this.load(fst),
      snd: this.load(snd),
    };
    this.schedule(run);
    return dst;
  }
}
