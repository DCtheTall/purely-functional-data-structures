/*

Purely Functional Data Structures
=================================
Binomial Heap
-------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  EmptyList,
  isEmpty as isEmptyList,
  cons,
  length,
  reverse,
} from './List';
import { less, leq, greater, raise, Comparable } from './util';

class Tree<T extends Comparable> {
  constructor(
    public readonly rank: number,
    public readonly value: T,
    public readonly children: Heap<T>,
  ) {
    Object.freeze(this);
  }
}

export type Heap<T extends Comparable> = List<Tree<T>>;

export const EmptyHeap = EmptyList;

export const isEmpty = isEmptyList;

const link = <T extends Comparable>(A: Tree<T>, B: Tree<T>): Tree<T> =>
  (leq(A.value, B.value) ?
    new Tree(A.rank + 1, A.value, cons(B, A.children))
  : new Tree(B.rank + 1, B.value, cons(A, B.children)));

const insertTree =
  <T extends Comparable>(Tr: Tree<T>, H: Heap<T>): Heap<T> =>
    (isEmpty(H) ? cons(Tr, EmptyHeap)
    : (less(Tr.rank, H.head.rank) ?
      cons(Tr, H)
    : greater(Tr.rank, H.head.rank) ?
      cons(H.head, insertTree(Tr, H.tail))
    : insertTree(link(Tr, H.head), H.tail)));

export const insert = <T extends Comparable>(val: T, H: Heap<T>) =>
  insertTree(new Tree(0, val, EmptyHeap), H);

export const merge = <T extends Comparable>(A: Heap<T>, B: Heap<T>) =>
  (isEmpty(A) ? B
  : (isEmpty(B) ? A
  : less(A.head.rank, B.head.rank) ?
    cons(A.head, merge(A.tail, B))
  : (less(B.head.rank, A.head.rank) ?
    cons(B.head, merge(A, B.tail))
  : cons(link(A.head, B.head), merge(A.tail, B.tail)))));

const removeMinTree = <T extends Comparable>(H: Heap<T>): [Tree<T>, Heap<T>] => {
  if (isEmpty(H))
    raise('EmptyHeap');
  if (length(H) === 1)
    return [H.head, EmptyHeap];
  let [minTree, rest] = removeMinTree(H.tail);
  if (less(H.head.value, minTree.value))
    return [H.head, H.tail];
  return [minTree, cons(H.head, rest)];
};

export const findMin = <T extends Comparable>(H: Heap<T>): T =>
  (<Tree<T>>removeMinTree(H)[0]).value;

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> => {
  let [minTree, rest] = removeMinTree(H);
  return merge(reverse(minTree.children), rest);
};

