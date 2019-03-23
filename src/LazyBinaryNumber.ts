/*

Purely Functional Data Structures
=================================
Lazy Binary Number
------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { Stream, EmptyStream, cons } from './Stream';
import { $, raise } from './util';

enum Digit { ZERO, ONE };

export type Binary = Stream<Digit>;

export const Zero = <Stream<Digit>>EmptyStream;

const isDigitZero = (D: Digit) => (D === Digit.ZERO);

const xor = (A: Digit, B: Digit): Digit =>
  (isDigitZero(A) ? B
  : (isDigitZero(B) ? A
  : Digit.ZERO));

const and = (A: Digit, B: Digit): Digit =>
  (isDigitZero(A) ? A : B);

const isBinaryZero = (B: Binary) => (B === Zero);

export const inc = (B: Binary): Binary =>
  $(() =>
    (isBinaryZero(B) ?
      cons(Digit.ONE, Zero)
    : (isDigitZero(B.force().head) ?
      cons(Digit.ZERO, B.force().tail)
    : cons(Digit.ZERO, inc(B.force().tail)))).force());

export const dec = (B: Binary): Binary =>
  $(() =>
    (isBinaryZero(B) ?
      raise('OutOfBounds')
    : ((!isDigitZero(B.force().head)) && isBinaryZero(B.force().tail) ?
      Zero
    : (!isDigitZero(B.force().head) ?
      cons(Digit.ZERO, B.force().tail)
    : cons(Digit.ONE, dec(B.force().tail))))).force());

export const add = (X: Binary, Y: Binary): Binary =>
  $(() =>
    (isBinaryZero(X) ? Y
    : (isBinaryZero(Y) ? X
    : (!isDigitZero(and(X.force().head, Y.force().head)) ?
      cons(
        Digit.ZERO,
        inc(add(X.force().tail, Y.force().tail)))
    : cons(
      xor(X.force().head, Y.force().head),
      add(X.force().tail, Y.force().tail))))).force());
