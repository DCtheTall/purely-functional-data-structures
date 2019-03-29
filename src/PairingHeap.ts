/*

Purely Functional Data Structures
=================================
Pairing Heap
------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, cons, EmptyList, isEmpty as isEmptyList } from './List';
import { leq, raise, Comparable } from './util';

export class Heap<T extends Comparable> {
  constructor(
    public readonly min: T,
    public readonly children: List<Heap<T>>,
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
    new Heap(A.min, cons(B, A.children))
  : new Heap(B.min, cons(A, B.children)))));

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> =>
  merge(new Heap(x, EmptyList), H);

const mergePairs = <T extends Comparable>(L: List<Heap<T>>): Heap<T> =>
  (isEmptyList(L) ?
    EmptyHeap
  : (isEmptyList(L.tail) ?
    L.head
  : merge(
    merge(L.head, L.tail.head),
    mergePairs(L.tail.tail))));

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    raise('EmptyHeap')
  : mergePairs(H.children));
