/*

Purely Functional Data Structures
=================================
Leftist Heap
------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { leq } from './util';

export class Heap<T> {
  constructor(
    public readonly rank: number,
    public readonly min: T,
    public readonly left: Heap<T>,
    public readonly right: Heap<T>,
  ) {
    Object.freeze(this);
  }

  static create<T>(min: T, left: Heap<T>, right: Heap<T>) {
    if (left.rank >= right.rank)
      return new Heap(right.rank + 1, min, left, right);
    return new Heap(left.rank + 1, min, right, left);
  }
}

export const EmptyHeap = <Heap<any>>null;

export const isEmpty = (H: Heap<any>) => (H === EmptyHeap);

export const findMin = <T>(H: Heap<T>) => H.min;

export const merge =
  <T>(A: Heap<T>, B: Heap<T>): Heap<T> =>
    (isEmpty(A) ? B
    : (isEmpty(B) ? A
    : (leq(A.min, B.min) ?
      Heap.create(A.min, A.left, merge(A.right, B))
    : Heap.create(B.min, B.left, merge(A, B.right)))));

export const insert = <T>(x: T, H: Heap<T>): Heap<T> =>
  (<Heap<T>>merge(new Heap(1, x, EmptyHeap, EmptyHeap), H));

export const deleteMin = <T>(H: Heap<T>): Heap<T> =>
  (<Heap<T>>merge(H.left, H.right));

