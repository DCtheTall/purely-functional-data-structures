/*

Purely Functional Data Structures
=================================
Lazy Evaluation
---------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

const UNEVALUATED = Symbol('unevaluated');

export class Suspension<T> {
  private cachedResult: T = <any>UNEVALUATED;

  constructor(
    private expr: () => T,
  ) {}

  public force() {
    if (this.cachedResult === <any>UNEVALUATED) {
      return this.cachedResult = this.expr();
    }
    return this.cachedResult;
  }
}

// The $ is taken from the book's SML code.
export const $ = <T>(expr: () => T) => new Suspension(expr);
