/*

Purely Functional Data Structures
=================================
Sparse Binary Number
--------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, isEmpty, cons } from './List';
import { raise } from './util';

export type Binary = List<number>;

export const Zero = EmptyList;

export const isZero = isEmpty;

const carry = (x: number, B: Binary): Binary =>
  (isZero(B) ?
    cons(x, Zero)
  : (x < B.head ?
    cons(x, B)
  : carry(x << 1, B.tail)));

const borrow = (x: number, B: Binary): Binary =>
  (isZero(B) ?
    raise('OutOfBounds')
  : (x === B.head ?
    B.tail
  : cons(x, borrow(x << 1, B))));

export const inc = (B: Binary): Binary => carry(1, B);

export const dec = (B: Binary): Binary => borrow(1, B);

export const add = (X: Binary, Y: Binary): Binary =>
  (isZero(X) ? Y
  : (isZero(Y) ? X
  : (X.head < Y.head ?
    cons(X.head, add(X.tail, Y))
  : (Y.head < X.head ?
    cons(Y.head, add(X, Y.tail))
  : carry(X.head << 1, add(X.tail, Y.tail))))));
