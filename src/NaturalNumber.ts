/*

Purely Functional Data Structures
=================================
Natural Number
--------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { raise } from './util';

export class Natural {
  constructor(
    public readonly tail: Natural,
  ) {
    Object.freeze(this);
  }
}

export const Zero = <Natural>null;

const isZero = (N: Natural) => (N === Zero);

export const succ = (N: Natural) => new Natural(N);

export const pred = (N: Natural) => N.tail;

export const add = (X: Natural, Y: Natural): Natural =>
  (isZero(X) ? Y : add(pred(X), succ(Y)));

export const subtract = (X: Natural, Y: Natural): Natural =>
  (isZero(Y) ? X
  : (isZero(X) ?
    raise('OutOfBounds')
  : subtract(pred(X), pred(Y))));
