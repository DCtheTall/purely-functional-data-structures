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
import { leq, Comparable } from './util';

export class Heap<T extends Comparable> extends BinaryTree<T> {
  public readonly left: Heap<T>;
  public readonly right: Heap<T>;
}

export const EmptyHeap = <Heap<any>>EmptyTree;

export const isEmpty = isEmptyTree;

export const findMin = <T extends Comparable>(H: Heap<T>): T =>
  H.value;

const merge = <T extends Comparable>(A: Heap<T>, B: Heap<T>): Heap<T> =>
  (isEmpty(A) ? B
  : (isEmpty(B) ? A
  : leq(A.value, B.value) ?
    new Heap(
      A.value,
      new Heap(
        B.value,
        B.left,
        A.left),
      EmptyHeap)
  : new Heap(
    B.value,
    new Heap(
      A.value,
      A.left,
      B.left),
    EmptyHeap)));

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> =>
  merge(new Heap(x, EmptyHeap, EmptyHeap), H);

const mergePairs = <T extends Comparable>(H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    EmptyHeap
  : (isEmpty(H.right) ?
    H
  : merge(
    merge(
      new Heap(
        H.value,
        H.left,
        EmptyHeap),
      new Heap(
        H.right.value,
        H.right.left,
        EmptyHeap)),
    mergePairs(H.right.right))));

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> =>
  mergePairs(H.left);
