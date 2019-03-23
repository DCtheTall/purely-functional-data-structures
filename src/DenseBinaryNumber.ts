/*

Purely Functional Data Structures
=================================
Dense Binary Number
-------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, cons } from './List';
import { raise } from './util';

enum Digit { ZERO, ONE };

export type Binary = List<Digit>;

export const Zero = <Binary>EmptyList;

const isDigitZero = (D: Digit) => (D === Digit.ZERO);

const xor = (A: Digit, B: Digit): Digit =>
  (isDigitZero(A) ? B
  : (isDigitZero(B) ? A
  : Digit.ZERO));

const and = (A: Digit, B: Digit): Digit =>
  (isDigitZero(A) ? A : B);

const isBinaryZero = (B: Binary) => (B === Zero);

export const inc = (B: Binary): Binary =>
  (isBinaryZero(B) ?
    cons(Digit.ONE, Zero)
  : (isDigitZero(B.head) ?
    cons(Digit.ONE, B.tail)
  : cons(Digit.ZERO, inc(B.tail))));

export const dec = (B: Binary): Binary =>
  (isBinaryZero(B) ?
    raise('OutOfBounds')
  : ((!isDigitZero(B.head)) && isBinaryZero(B.tail) ?
    Zero
  : (!isDigitZero(B.head) ?
    cons(Digit.ZERO, B.tail)
  : cons(Digit.ONE, dec(B.tail)))));

export const add = (X: Binary, Y: Binary): Binary =>
  (isBinaryZero(X) ? Y
  : (isBinaryZero(Y) ? X
  : (!isDigitZero(and(X.head, Y.head)) ?
    cons(Digit.ZERO, inc(add(X.tail, Y.tail)))
  : cons(xor(X.head, Y.head), add(X.tail, Y.tail)))));
