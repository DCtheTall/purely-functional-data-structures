/*

Purely Functional Data Structures
=================================
Segmented Binary Number
-----------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, isEmpty, cons } from './List';
import { raise } from './util';

class Zeroes {
  constructor(
    public readonly size: number,
  ) {
    Object.freeze(this);
  }
}

class Ones {
  constructor(
    public readonly size: number,
  ) {
    Object.freeze(this);
  }
}

type Digits = Zeroes| Ones;

export type Binary = List<Digits>;

export const Zero = <Binary>EmptyList;

export const isZero = isEmpty;

const zeroes = (i: number, B: Binary): Binary =>
  (isZero(B) ? Zero
  : (i === 0 ? B
  : (B.head instanceof Zeroes ?
    cons(new Zeroes(i + B.head.size), B.tail)
  : cons(new Zeroes(i), B))));

const ones = (i: number, B: Binary): Binary =>
  (isZero(B) ?
    cons(new Ones(i), B)
  : (i === 0 ? B
  : (B.head instanceof Ones ?
    cons(new Ones(i + B.head.size), B.tail)
  : cons(new Ones(i), B))));

export const inc = (B: Binary): Binary =>
  (isZero(B) ?
    cons(new Ones(1), Zero)
  : (B.head instanceof Zeroes ?
    ones(1, zeroes(B.head.size - 1, B.tail))
  : cons(new Zeroes(B.head.size), inc(B.tail))));

export const dec = (B: Binary): Binary =>
  (isZero(B) ?
    raise('OutOfBounds')
  : (B.head instanceof Zeroes ?
    cons(new Ones(B.head.size), dec(B.tail))
  : zeroes(1, ones(B.head.size - 1, B.tail))));
