/*

Purely Functional Data Structures
=================================
Lazy Binomial Heap
------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, isEmpty as isEmptyList, cons } from './List';
import { Suspension, $, leq, less, raise, Comparable } from './util';

export class Tree<T extends Comparable> {
  constructor(
    public readonly rank: number,
    public readonly value: T,
    public readonly children: List<Tree<T>>,
  ) {
    Object.freeze(this);
  }
}

export type Heap<T extends Comparable> = Suspension<List<Tree<T>>>;

export const EmptyHeap = <Heap<any>>$(() => EmptyList);

export const isEmpty = isEmptyList;

const link = <T extends Comparable>(A: Tree<T>, B: Tree<T>): Tree<T> =>
  (leq(A.value, B.value) ?
    new Tree(A.rank + 1, A.value, cons(B, A.children))
  : new Tree(B.rank + 1, B.value, cons(A, B.children)));

const insTree = <T extends Comparable>(Tr: Tree<T>, TL: List<Tree<T>>): List<Tree<T>> =>
  (isEmptyList(TL) ?
    cons(Tr, EmptyList)
  : (less(Tr.rank, TL.head.rank)) ?
    cons(Tr, TL)
  : insTree(link(Tr, TL.head), TL.tail));

const mrg = <T extends Comparable>(A: List<Tree<T>>, B: List<Tree<T>>): List<Tree<T>> =>
  (isEmptyList(A) ? B
  : (isEmptyList(B) ? A
  : less(A.head.rank, B.head.rank) ?
    cons(A.head, mrg(A.tail, B))
  : (less(B.head.rank, A.head.rank) ?
    cons(B.head, mrg(A, B.tail))
  : cons(link(A.head, B.head), mrg(A.tail, B.tail)))));

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> =>
  $(() => insTree(new Tree(0, x, EmptyList), H.force()));

export const merge = <T extends Comparable>(A: Heap<T>, B: Heap<T>): Heap<T> =>
  $(() => mrg(A.force(), B.force()));

const removeMinTree = <T extends Comparable>(H: List<Tree<T>>): [Tree<T>, List<Tree<T>>] => {
  if (isEmptyList(H))
    raise('Empty')
  if (isEmptyList(H.tail))
    return [H.head, EmptyList];
  let [minTree, rest] = removeMinTree(H.tail);
  if (less(H.head.value, minTree.value))
    return [H.head, cons(minTree, rest)];
  return [minTree, cons(H.head, rest)];
};

export const findMin = <T extends Comparable>(H: Heap<T>): T =>
  removeMinTree(H.force())[0].value;

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> =>
  $(() => removeMinTree(H.force())[1]);
