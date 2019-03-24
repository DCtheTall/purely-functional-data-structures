/*

Purely Functional Data Structures
=================================
Skew Binomial Heap
------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  EmptyList,
  isEmpty as isEmptyList,
  cons,
  reverse,
} from './List';
import { leq, less, equal } from './util';

class Tree<T> {
  constructor(
    public readonly rank: number,
    public readonly root: T,
    public readonly values: List<T>,
    public readonly children: Heap<T>,
  ) {
    Object.freeze(this);
  }
}

export type Heap<T> = List<Tree<T>>;

export const EmptyHeap = <Heap<any>>EmptyList;

export const isEmpty = (H: Heap<any>) => (H === EmptyHeap);

const link = <T>(T1: Tree<T>, T2: Tree<T>): Tree<T> =>
  (leq(T1.root, T2.root) ?
    new Tree(
      T1.rank + 1,
      T1.root,
      T1.values,
      cons(T2, T1.children))
    : new Tree(
      T2.rank + 1,
      T2.root,
      T2.values,
      cons(T1, T2.children)));

const skewLink = <T>(x: T, T1: Tree<T>, T2: Tree<T>): Tree<T> => {
  let linked = link(T1, T2);
  if (leq(x, linked.root))
    return new Tree(
      linked.rank,
      x,
      cons(linked.root, linked.values),
      linked.children);
  return new Tree(
    linked.rank,
    linked.root,
    cons(x, linked.values),
    linked.children);
};

const insTree = <T>(Tr: Tree<T>, H: Heap<T>) =>
  (isEmptyList(H) ?
    cons(Tr, EmptyHeap)
  : (less(Tr.rank, H.head.rank) ?
    cons(Tr, H)
  : cons(link(Tr, H.head), H.tail)));

const mergeTrees = <T>(H1: Heap<T>, H2: Heap<T>): Heap<T> =>
  (isEmptyList(H1) ?
    H2
  : (isEmptyList(H2) ?
    H1
  : (less(H1.head.rank, H2.head.rank) ?
    cons(H1.head, mergeTrees(H1.tail, H2))
  : (less(H2.head.rank, H1.head.rank) ?
    cons(H2.head, merge(H1, H2.tail))
  : cons(link(H1.head, H2.head), mergeTrees(H1.tail, H2.tail))))));

const normalize = <T>(H: Heap<T>): Heap<T> =>
  (isEmptyList(H) ?
    EmptyHeap
    : insTree(H.head, H.tail));

export const insert = <T>(x: T, H: Heap<T>): Heap<T> =>
  (isEmptyList(H) || isEmptyList(H.tail) ?
    cons(new Tree(0, x, EmptyList, EmptyHeap), H)
  : ((!isEmptyList(H.tail)) &&
    equal(H.head.rank, H.tail.head.rank) ?
    cons(
      skewLink(
        x,
        H.head,
        H.tail.head),
      H.tail.tail)
    : cons(new Tree(0, x, EmptyList, EmptyHeap), H)));

export const merge = <T>(H1: Heap<T>, H2: Heap<T>): Heap<T> =>
  mergeTrees(
    normalize(H1),
    normalize(H2));

const removeMinTree = <T>(H: Heap<T>): Heap<T> => {
  if (isEmptyList(H))
    throw new Error('Empty');
  if (isEmptyList(H.tail))
    return H;
  let val = removeMinTree(H.tail);
  if (leq(H.head.root, val.head.root))
    return H;
  return cons(val.head, cons(H.head, val.tail));
};

export const findMin = <T>(H: Heap<T>): T => {
  if (isEmptyList(H))
    throw new Error('Empty');
  return removeMinTree(H).head.root;
};

const insertAll = <T>(xs: List<T>, H: Heap<T>): Heap<T> =>
  (isEmptyList(xs) ?
    H
  : insertAll(
    xs.tail,
    insert(xs.head, H)));

export const deleteMin = <T>(H: Heap<T>): Heap<T> => {
  if (isEmptyList(H))
    throw new Error('Empty');
  let val = removeMinTree(H);
  return insertAll(
    val.head.values,
    merge(
      reverse(val.head.children),
      val.tail));
};
