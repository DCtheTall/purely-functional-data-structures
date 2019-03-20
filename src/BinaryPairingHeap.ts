/*

Purely Functional Data Structures
=================================
Binary Pairing Heap
-------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
    BinaryTree,
    EmptyTree,
    isEmpty as isEmptyTree,
} from './BinaryTree';
import { leq } from './util';

export class Heap<T> extends BinaryTree<T> {
  public readonly left: Heap<T>;
  public readonly right: Heap<T>;

  get min(): T {
    return this.value;
  }
}

export const EmptyHeap = <Heap<any>>EmptyTree;

export const isEmpty = isEmptyTree;

const merge = <T>(A: Heap<T>, B: Heap<T>): Heap<T> =>
  (isEmpty(A) ? B
  : (isEmpty(B) ? A
  : leq(A.min, B.min) ?
    new Heap(
      A.min,
      new Heap(
        B.min,
        B.left,
        A.left),
      EmptyHeap)
  : new Heap(
    B.min,
    new Heap(
      A.min,
      A.left,
      B.left),
    EmptyHeap)));

export const insert = <T>(x: T, H: Heap<T>): Heap<T> =>
  merge(new Heap(x, EmptyHeap, EmptyHeap), H);

const mergePairs = <T>(H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    EmptyHeap
  : (isEmpty(H.right) ?
    H
  : merge(
    merge(
      new Heap(
        H.min,
        H.left,
        EmptyHeap),
      new Heap(
        H.right.value,
        H.right.left,
        EmptyHeap)),
    mergePairs(H.right.right))));

export const deleteMin = <T>(H: Heap<T>): Heap<T> =>
  mergePairs(H.left);