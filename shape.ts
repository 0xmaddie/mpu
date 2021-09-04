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
    return this._height * this._width;
  }

  equals(rhs: Shape): boolean {
    return this.height === rhs.height && this.width === rhs.width;
  }

  toString(): string {
    return `${this.height}x${this.width}`;
  }
}

export type ShapeLike = number[] | Shape;
