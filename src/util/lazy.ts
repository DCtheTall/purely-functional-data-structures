/*

Purely Functional Data Structures
=================================
Lazy Evaluation
---------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

const UNEVALUATED = Symbol('unevaluated');

class Suspension<T> {
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

export const lazy =
  <S extends any[], T>(func: (...args: S) => T) =>
    (...args: S) => new Suspension(() => func(...args));
