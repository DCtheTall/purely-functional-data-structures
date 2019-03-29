/*

Purely Functional Data Structures
=================================
Lazy Pairing Heap
-----------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { Suspension, $, leq, raise, Comparable } from './util';

export class Heap<T extends Comparable> {
  constructor(
    public readonly min: T,
    public readonly odd: Heap<T>,
    public readonly children: Suspension<Heap<T>>,
  ) {
    Object.freeze(this);
  }
}

export const EmptyHeap = <Heap<any>>null;

export const isEmpty = (H: Heap<any>) => (H === EmptyHeap);

const merge = <T extends Comparable>(A: Heap<T>, B: Heap<T>): Heap<T> =>
  (isEmpty(A) ? B
  : (isEmpty(B) ? A
  : (leq(A.min, B.min) ?
    link(A, B)
  : link(B, A))));

const link = <T extends Comparable>(A: Heap<T>, B: Heap<T>): Heap<T> =>
  (isEmpty(A.odd) ?
    new Heap(A.min, B, A.children)
  : new Heap(
    A.min,
    EmptyHeap,
    $(() => merge(merge(A.odd, B), A.children.force()))));

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> =>
  merge(new Heap(x, EmptyHeap, $(() => EmptyHeap)), H);

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    raise('EmptyHeap')
  : merge(H.odd, H.children.force()));
