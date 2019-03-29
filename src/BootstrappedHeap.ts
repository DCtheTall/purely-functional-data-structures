/*

Purely Functional Data Structures
=================================
Bootstrapped Heap
-----------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Heap as SkewBinomialHeap,
  insert as skewHeapInsert,
  EmptyHeap as EmptySkewHeap,
  isEmpty as isEmptySkewHeap,
  findMin as skewHeapFindMin,
  merge as mergeSkewHeaps,
  deleteMin as skewHeapDeleteMin,
} from './SkewBinomialHeap';
import {
} from './List';
import { less, equal, leq, Comparable } from './util';

type PrimHeap<T extends Comparable> = SkewBinomialHeap<Heap<T>>

export class Heap<T extends Comparable> {
  constructor(
    public readonly min: T,
    public readonly heap: PrimHeap<T>,
  ) {
    Object.freeze(this);
  }

  public less(h: Heap<T>): boolean {
    return less(this.min, h.min);
  }

  public equals(h: Heap<T>): boolean {
    return equal(this.min, h.min);
  }
}

export const EmptyHeap = <Heap<any>>null;

export const isEmptyHeap = (H: Heap<any>) => (H === EmptyHeap);

export const merge = <T extends Comparable>(H1: Heap<T>, H2: Heap<T>): Heap<T> =>
  (isEmptyHeap(H1) ?
    H2
  : (isEmptyHeap(H2) ?
    H1
  : (leq(H1.min, H2.min) ?
    new Heap(
      H1.min,
      skewHeapInsert(H2, H1.heap))
  : new Heap(
    H2.min,
    skewHeapInsert(H1, H2.heap)))));

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> =>
    merge(H, new Heap(x, EmptySkewHeap));

export const findMin = <T extends Comparable>(H: Heap<T>): T => {
  if (isEmptyHeap(H))
    throw new Error('EmptyHeap');
  return H.min;
};

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap <T> => {
  if(isEmptyHeap(H))
    throw new Error('EmptyHeap');
  if (isEmptySkewHeap(H.heap))
    return EmptyHeap;
  let h = skewHeapFindMin(H.heap);
  let p = skewHeapDeleteMin(H.heap);
  return new Heap(
    h.min,
    mergeSkewHeaps(h.heap, p));
};
