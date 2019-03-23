/*

Purely Functional Data Structures
=================================
Skew Binary Number
------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, cons, EmptyList, isEmpty } from './List';
import { raise } from './util';

export type Binary = List<number>;

export const Zero = <Binary>EmptyList;

export const isZero = isEmpty;

export const inc = (B: Binary): Binary =>
  (isZero(B) ?
    cons(1, Zero)
  : (isZero(B.tail) ?
    cons(1, B)
  : (B.head === B.tail.head ?
    cons(1 + (2 * B.head), B.tail)
  : cons(1, B))));

export const dec = (B: Binary): Binary =>
  (isZero(B) ?
    raise('OutOfBounds')
  : (isZero(B.tail) ?
    Zero
  : (B.head === 1 ?
    B.tail
  : cons(B.head >> 1, cons(B.head >> 1, B.tail)))));
