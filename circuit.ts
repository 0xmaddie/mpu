export abstract class Ob {
  get fst(): Ob {
    throw `${this} is not a pair`;
  }

  get snd(): Ob {
    throw `${this} is not a pair`;
  }

  get asMatrix(): Matrix {
    throw `${this} is not a matrix`;
  }

  static get unit(): Ob {
    return new Unit();
  }

  static pair(fst: Ob, snd: Ob): Ob {
    return new Pair(fst, snd);
  }

  static assertUnit(ob: Ob): void {
    if (!(ob instanceof Unit)) {
      throw `expected unit, but got ${ob}`;
    }
  }

  static assertMatrix(ob: Ob): void {
    if (!(ob instanceof Matrix)) {
      throw `expected a matrix, but got ${ob}`;
    }
  }
}

export class Unit extends Ob {
  constructor() {
    super();
  }

  toString(): string {
    return "ob_unit";
  }
}

export class Shape {
  _height: number;
  _width: number;

  constructor(height: number, width: number) {
    this._height = height;
    this._width = width;
  }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  get capacity(): number {
    return this._height*this._width;
  }

  equals(rhs: Shape): boolean {
    return this.height === rhs.height && this.width === rhs.width;
  }

  toString(): string {
    return `${this.height}x${this.width}`;
  }
}

export type ShapeLike = number[] | Shape;

export class Matrix extends Ob {
  _shape: Shape;
  _uid: number;

  constructor(shape: ShapeLike, uid: number) {
    super();
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

export class Pair extends Ob {
  _fst: Ob;
  _snd: Ob;

  constructor(fst: Ob, snd: Ob) {
    super();
    this._fst = fst;
    this._snd = snd;
  }

  get fst(): Ob {
    return this._fst;
  }

  get snd(): Ob {
    return this._snd;
  }

  toString(): string {
    const fst = this._fst.toString();
    const snd = this._snd.toString();
    return `${fst} ${snd} ob_pair`;
  }
}

export abstract class Circuit {
  abstract apply(src: Ob, ctx: Env): Ob;
  
  static get id(): Circuit {
    return new Id();
  }

  static get braid(): Circuit {
    return new Braid();
  }

  static zero(shape: ShapeLike): Circuit {
    return new Operator("zero", shape);
  }

  static one(shape: ShapeLike): Circuit {
    return new Operator("one", shape);
  }

  static constant(
    shape: ShapeLike,
    value: number[],
  ): Circuit {
    return new Operator("constant", shape, value);
  }

  static sumk(
    k: number,
  ): Circuit {
    return new Operator("sumk", k);
  }

  static randomUniform(
    shape: ShapeLike,
    min: number,
    max: number,
  ): Circuit {
    return new Operator("randomUniform", shape, min, max);
  }

  static get dual(): Circuit {
    return new Operator("dual");
  }

  static get relu(): Circuit {
    return new Operator("relu");
  }

  static get cos(): Circuit {
    return new Operator("cos");
  }

  static get sin(): Circuit {
    return new Operator("sin");
  }

  static get cis(): Circuit {
    return new Operator("cis");
  }

  static get sic(): Circuit {
    return new Operator("sic");
  }

  static get add(): Circuit {
    return new Operator("add");
  }

  static get mul(): Circuit {
    return new Operator("mul");
  }

  static get point(): Circuit {
    return new Operator("point");
  }

  static get drop(): Circuit {
    return new Operator("drop");
  }

  static get copy(): Circuit {
    return new Operator("copy");
  }
}

export class Id extends Circuit {
  constructor() {
    super();
  }

  seq(rhs: Circuit): Circuit {
    return rhs;
  }

  apply(src: Ob, _ctx: Env): Ob {
    return src;
  }

  toString(): string {
    return `circuit_id`;
  }
}

export class Braid extends Circuit {
  constructor() {
    super();
  }

  apply(src: Ob, _ctx: Env): Ob {
    return Ob.pair(src.snd, src.fst);
  }

  toString(): string {
    return `circuit_braid`;
  }
}

export type Opcode =
  | "zero"
  | "one"
  | "constant"
  | "dual"
  | "relu"
  | "cos"
  | "sin"
  | "cis"
  | "sic"
  | "sumk"
  | "add"
  | "mul"
  | "point"
  | "drop"
  | "copy"
  | "randomUniform"

export type Parameter =
  | number
  | number[]
  | Shape

export class Operator extends Circuit {
  name: Opcode;
  parameter: Parameter[];

  constructor(
    name: Opcode,
    ...parameter: Parameter[]
  ) {
    super();
    this.name = name;
    if (parameter) {
      this.parameter = parameter;
    } else {
      this.parameter = [];
    }
  }

  apply(src: Ob, ctx: Env): Ob {
    switch (this.name) {
      case "zero": {
        Ob.assertUnit(src);
        const [shape] = this.parameter;
        if (Array.isArray(shape) || shape instanceof Shape) {
          return ctx.zero(shape);
        }
        throw new ParameterError(this);
      }
      case "one": {
        Ob.assertUnit(src);
        const [shape] = this.parameter;
        if (Array.isArray(shape) || shape instanceof Shape) {
          return ctx.one(shape);
        }
        throw new ParameterError(this);
      }
      case "constant": {
        Ob.assertUnit(src);
        const [shape, values] = this.parameter;
        if (
          (Array.isArray(shape) || shape instanceof Shape) &&
          Array.isArray(values)
        ) {
          return ctx.constant(shape, values);
        }
        throw new ParameterError(this);
      }
      case "randomUniform": {
        Ob.assertUnit(src);
        const [shape, min, max] = this.parameter;
        if (
          (Array.isArray(shape) || shape instanceof Shape) &&
          typeof(min) === "number" &&
          typeof(max) === "number"
        ) {
          return ctx.randomUniform(shape, min, max);
        }
        throw new ParameterError(this);
      }
      case "dual": {
        return ctx.dual(src.asMatrix);
      }
      case "relu": {
        return ctx.relu(src.asMatrix);
      }
      case "cos": {
        return ctx.cos(src.asMatrix);
      }
      case "sin": {
        return ctx.sin(src.asMatrix);
      }
      case "cis": {
        return ctx.cis(src.asMatrix);
      }
      case "sic": {
        return ctx.sic(src.asMatrix);
      }
      case "sumk": {
        const [k] = this.parameter;
        if (typeof(k) === "number") {
          return ctx.sumk(src.asMatrix, k);
        }
        throw new ParameterError(this);
      }
      case "add": {
        return ctx.add(
          src.fst.asMatrix,
          src.snd.asMatrix,
        );
      }
      case "mul": {
        return ctx.mul(
          src.fst.asMatrix,
          src.snd.asMatrix,
        );
      }
      case "point": {
        return ctx.point(
          src.fst.asMatrix,
          src.snd.asMatrix,
        );
      }
      case "drop": {
        Ob.assertMatrix(src);
        return Ob.unit;
      }
      case "copy": {
        Ob.assertMatrix(src);
        return Ob.pair(src, src);
      }
    }
  }

  toString(): string {
    return `circuit_${this.name}`;
  }
}

export class Sequence extends Circuit {
  _fst: Circuit;
  _snd: Circuit;

  constructor(fst: Circuit, snd: Circuit) {
    super();
    this._fst = fst;
    this._snd = snd;
  }

  get fst(): Circuit {
    return this._fst;
  }

  get snd(): Circuit {
    return this._snd;
  }

  apply(src: Ob, ctx: Env): Ob {
    const inner = this.fst.apply(src, ctx);
    return this.snd.apply(inner, ctx);
  }

  toString(): string {
    return `${this.fst} ${this.snd} circuit_seq`;
  }
}

export class Parallel extends Circuit {
  _fst: Circuit;
  _snd: Circuit;

  constructor(fst: Circuit, snd: Circuit) {
    super();
    this._fst = fst;
    this._snd = snd;
  }

  get fst(): Circuit {
    return this._fst;
  }

  get snd(): Circuit {
    return this._snd;
  }

  apply(src: Ob, ctx: Env): Ob {
    const fst = this.fst.apply(src.fst, ctx);
    const snd = this.snd.apply(src.snd, ctx);
    return Ob.pair(fst, snd);
  }

  toString(): string {
    return `${this.fst} ${this.snd} circuit_par`;
  }
}

export class MatrixBuffer {
  shape: Shape;
  buffer: Float32Array;

  constructor(
    shape: ShapeLike,
    buffer?: Float32Array | number[],
  ) {
    if (shape instanceof Shape) {
      this.shape = shape;
    } else {
      this.shape = new Shape(shape[0], shape[1]);
    }
    if (buffer) {
      this.buffer = new Float32Array(buffer);
    } else {
      this.buffer = new Float32Array(this.capacity);
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

  randomUniform(min: number, max: number): void {
    const delta = max-min;
    for (let i = 0; i < this.capacity; ++i) {
      this.buffer[i] = min+Math.random()*delta;
    }
  }

  dual(src: MatrixBuffer): void {
    if (this.height !== src.width || this.width !== src.height) {
      throw new ShapeError("dual", this, src);
    }
    for (let row = 0; row < this.height; ++row) {
      for (let col = 0; col < this.width; ++col) {
        this.buffer[row*this.width+col] = src.buffer[col*src.width+row];
      }
    }
  }

  relu(src: MatrixBuffer): void {
    if (!(this.shape.equals(src.shape))) {
      throw new ShapeError("relu", this, src);
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      this.buffer[i] = src.buffer[i] > 0? src.buffer[i] : 0;
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
      if ((i%2) === 0) {
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
      if ((i%2) === 0) {
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
        const lhs = fst.buffer[row*fst.width+dot];
        for (let col = 0; col < snd.width; ++col) {
          const rhs = snd.buffer[dot*snd.width+col];
          this.buffer[row*this.width+col] += lhs * rhs;
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
    let sum = 0;
    for (let i = 0; i < this.shape.capacity; ++i) {
      sum += src.buffer[i];
    }
    for (let i = 0; i < this.shape.capacity; ++i) {
      if (i === k) {
        this.buffer[i] = sum;
      } else {
        this.buffer[i] = 0;
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
}

export class Env {
  code: (() => void)[];
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

  schedule(thunk: () => void) {
    this.code.push(thunk);
  }

  load(pointer: Matrix): MatrixBuffer {
    return this.data[pointer.uid];
  }

  execute(): void {
    for (const thunk of this.code) {
      thunk();
    }
  }

  zero(shape: ShapeLike): Matrix {
    const dst = this.allocate(shape);
    const thunk = () => {
      const dst_buf = this.load(dst);
      dst_buf.zero();
    };
    this.schedule(thunk);
    return dst;
  }

  one(shape: ShapeLike): Matrix {
    const dst = this.allocate(shape);
    const thunk = () => {
      const dst_buf = this.load(dst);
      dst_buf.one();
    };
    this.schedule(thunk);
    return dst;
  }

  constant(
    shape: ShapeLike,
    buffer: number[] | Float32Array,
  ): Matrix {
    const dst = this.allocate(shape);
    const thunk = () => {
      const dst_buf = this.load(dst);
      dst_buf.buffer = new Float32Array(buffer);
    };
    this.schedule(thunk);
    return dst;
  }

  dual(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.dual(src_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  relu(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.relu(src_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  cos(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.cos(src_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  sin(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.sin(src_buf);
    };
    this.schedule(thunk);
    return dst;
  }
  
  cis(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.cis(src_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  sic(src: Matrix): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.sic(src_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  sumk(src: Matrix, k: number): Matrix {
    const dst = this.allocate(src.shape);
    const thunk = () => {
      const src_buf = this.load(src);
      const dst_buf = this.load(dst);
      dst_buf.sumk(src_buf, k);
    };
    this.schedule(thunk);
    return dst;
  }

  randomUniform(
    shape: ShapeLike,
    min: number,
    max: number,
  ): Matrix {
    const dst = this.allocate(shape);
    const thunk = () => {
      const dst_buf = this.load(dst);
      dst_buf.randomUniform(min, max);
    };
    this.schedule(thunk);
    return dst;
  }

  add(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const thunk = () => {
      const fst_buf = this.load(fst);
      const snd_buf = this.load(snd);
      const dst_buf = this.load(dst);
      dst_buf.add(fst_buf, snd_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  mul(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const thunk = () => {
      const fst_buf = this.load(fst);
      const snd_buf = this.load(snd);
      const dst_buf = this.load(dst);
      dst_buf.mul(fst_buf, snd_buf);
    };
    this.schedule(thunk);
    return dst;
  }

  point(fst: Matrix, snd: Matrix): Matrix {
    const dst = this.allocate(fst.shape);
    const thunk = () => {
      const fst_buf = this.load(fst);
      const snd_buf = this.load(snd);
      const dst_buf = this.load(dst);
      dst_buf.point(fst_buf, snd_buf);
    };
    this.schedule(thunk);
    return dst;
  }
}

export class ParameterError {
  tag: "circuit.parameter-error" = "circuit.parameter-error";
  circuit: Circuit;

  constructor(circuit: Circuit) {
    this.circuit = circuit;
  }

  toString(): string {
    return `Invalid parameters for circuit ${this.circuit}`;
  }
}

export class ShapeError {
  tag: "circuit.shape-error" = "circuit.shape-error";
  operator: string;
  buffer: MatrixBuffer[];

  constructor(operator: string, ...buffer: MatrixBuffer[]) {
    this.operator = operator;
    this.buffer = buffer;
  }

  toString(): string {
    const shapes = this.buffer.map((x) => x.shape);
    return `Invalid shapes for operator ${this.operator} @ ${shapes}`;
  }
}
