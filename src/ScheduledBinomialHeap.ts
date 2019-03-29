/*

Purely Functional Data Structures
=================================
Scheduled Binomial Heap
-----------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  cons as consList,
  isEmpty as isEmptyList,
  EmptyList
} from "./List";
import {
  Stream,
  isEmpty as isEmptyStream,
  cons as consStream,
  EmptyStream,
  listToStream,
} from './Stream';
import { leq, raise, Comparable } from './util';

class Tree<T extends Comparable> {
  constructor(
    public readonly value: T,
    public readonly children: List<Tree<T>>,
  ) {
    Object.freeze(this);
  }
}

const link = <T extends Comparable>(A: Tree<T>, B: Tree<T>): Tree<T> =>
  (leq(A.value, B.value) ?
    new Tree(A.value, consList(B, A.children))
  : new Tree(B.value, consList(A, B.children)));

type Digit<T extends Comparable> = 'ZERO' | Tree<T>;

const ZERO = 'ZERO';

const isZero = (D: Digit<any>) => (D === ZERO);

const insTree = <T extends Comparable>(D: Tree<T>, ds: Stream<Digit<T>>): Stream<Digit<T>> =>
  (isEmptyStream(ds) ?
    consStream(D, EmptyStream)
  : (isZero(ds.force().head) ?
    consStream(D, ds.force().tail)
  : consStream(
    ZERO,
    insTree(
      link(D, <Tree<T>>ds.force().head),
      ds.force().tail))));

const mrg = <T extends Comparable>(A: Stream<Digit<T>>, B: Stream<Digit<T>>): Stream<Digit<T>> =>
  (isEmptyStream(A) ? B
  : (isEmptyStream(B) ? A
  : (isZero(A.force().head) ?
    consStream(
      B.force().head,
      mrg(A.force().tail, B.force().tail))
  : (isZero(B.force().head) ?
    consStream(
      A.force().head,
      mrg(A.force().tail, B.force().tail))
  : consStream(
    <Digit<T>>ZERO,
    insTree(
      link(<Tree<T>>A.force().head, <Tree<T>>B.force().head),
      mrg(A.force().tail, B.force().tail)))))));

const normalize = <T extends Comparable>(ds: Stream<Digit<T>>): Stream<Digit<T>> =>
  (!isEmptyStream(ds) ?
    normalize(ds.force().tail)
  : ds);

const removeMinTree = <T extends Comparable>(ds: Stream<Digit<T>>): [Tree<T>, Stream<Digit<T>>] => {
  if (isEmptyStream(ds))
    raise('EmptyStream')
  if (isEmptyStream(ds.force().tail) && !isZero(ds.force().head))
    return [<Tree<T>>ds.force().head, EmptyStream];
  let [minTree, rest] = removeMinTree(ds.force().tail);
  if (isZero(ds.force().head))
    return [minTree, consStream(<Digit<T>>ZERO, rest)];
  if (leq((<Tree<T>>ds.force().head).value, minTree.value))
    return [(<Tree<T>>ds.force().head),
      consStream(<Digit<T>>ZERO, ds.force().tail)]
  return [minTree,
    consStream(ds.force().head, rest)];
};

type Schedule<T extends Comparable> = List<Stream<Digit<T>>>;

export class Heap<T extends Comparable> {
  constructor(
    public readonly digits: Stream<Digit<T>>,
    public readonly schedule: Schedule<T>,
  ) {
    Object.freeze(this);
  }
}

const exec = <T extends Comparable>(schedule: Schedule<T>): Schedule<T> =>
  (isEmptyList(schedule) ?
    EmptyList
  : (isZero(schedule.head.force().head) ?
    consList(schedule.head.force().tail, schedule.tail)
  : schedule.tail));

export const EmptyHeap = new Heap(EmptyStream, EmptyList);

export const isEmpty = (H: Heap<any>) => isEmptyStream(H.digits);

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> => {
  let ds = insTree(new Tree(x, EmptyList), H.digits);
  return new Heap(ds, exec(exec(consList(ds, H.schedule))));
};

export const findMin = <T extends Comparable>(H: Heap<T>) =>
  (isEmpty(H) ?
    raise('EmptyHeap')
  : removeMinTree(H.digits)[0].value);

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> => {
  let [minTree, rest] = removeMinTree(H.digits);
  return new Heap(
    normalize(mrg(
      listToStream(minTree.children),
      rest)),
    EmptyList);
};
