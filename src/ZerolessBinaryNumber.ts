/*

Purely Functional Data Structures
=================================
Zeroless Binary Number
----------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, isEmpty, cons } from './List';
import { raise } from './util';

class One {}

class Two {}

type Digit = One | Two;

export type Binary = List<Digit>;

export const Zero = <Binary>EmptyList;

export const isZero = isEmpty;

export const inc = (B: Binary): Binary =>
  (isZero(B) ?
    cons(new One(), Zero)
  : (B.head instanceof One ?
    cons(new Two(), B.tail)
  : cons(new One(), inc(B.tail))));

export const dec = (B: Binary): Binary =>
  (isZero(B) ?
    raise('OutOfBounds')
  : (B.head instanceof One && isZero(B.tail) ?
    Zero
  : (B.head instanceof Two ?
    cons(new One(), B.tail)
  : cons(new Two(), dec(B.tail)))));

export const add = (X: Binary, Y: Binary): Binary =>
  (isZero(X) ? Y
  : (isZero(Y) ? X
  : (X.head instanceof One && Y.head instanceof One ?
    cons(new Two(), add(X.tail, Y.tail))
  : (X.head instanceof One || Y.head instanceof One ?
    cons(new Two(), inc(add(X.tail, Y.tail)))
  : cons(new Two(), inc(inc(add(X.tail, Y.tail))))))));
