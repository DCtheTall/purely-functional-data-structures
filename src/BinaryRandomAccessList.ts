/*

Purely Functional Data Structures
=================================
Binary Random Access List
-------------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  EmptyList,
  isEmpty as isEmptyList,
} from './List';
import { raise } from './util';

class Leaf<T> {
  constructor(
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

class Node<T> {
  constructor(
    public readonly size: number,
    public readonly left: Tree<T>,
    public readonly right: Tree<T>,
  ) {
    Object.freeze(this);
  }
}

type Tree<T> = Leaf<T> | Node<T>;

const size = (N: Tree<any>): number =>
  (N instanceof Leaf ? 1 : N.size);

class Zero {}

class One<T> {
  constructor(
    public readonly tree: Tree<T>,
  ) {
    Object.freeze(this);
  }
}

type Digit<T> = Zero | One<T>;

export class RList<T> extends List<Digit<T>> {
  constructor(
    public readonly head_: Digit<T>,
    public readonly tail_: RList<T>,
  ) {
    super(head_, tail_);
  }

  get head() {
    return (<Leaf<T>>unconsTree(this)[0]).value;
  }

  get tail(): RList<T> {
    return unconsTree(this)[1];
  }
}

const consList = <T>(D: Digit<T>, R: RList<T>): RList<T> =>
  new RList(D, R);

export const EmptyRList = <RList<any>>EmptyList;

export const isEmpty = isEmptyList;

const link = <T>(T1: Tree<T>, T2: Tree<T>): Node<T> =>
  new Node(size(T1) + size(T2), T1, T2);

const consTree = <T>(t: Tree<T>, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    consList(t, EmptyRList)
  : (R.head instanceof Zero ?
      consList(new One(t), R.tail_)
  : consList(
    new Zero(),
    consTree(link(t, R.head.tree), R.tail_))));

const unconsTree = <T>(R: RList<T>): [Tree<T>, RList<T>] => {
  if (isEmpty(R))
    raise('EmptyRList');
  if ((!(R.head instanceof Zero)) && isEmpty(R.tail))
    return [(<Node<T>>R.head.tree), EmptyRList];
  if (!(R.head instanceof Zero))
    return [(<Node<T>>R.head.tree), consList(new Zero(), R.tail_)];
  let [first, second] = unconsTree(R.tail_);
  return [(<Node<T>>first).left,
    consList((<Node<T>>first).right, second)];
};

export const cons = <T>(x: T, R: RList<T>): RList<T> =>
  consTree(new Leaf(x), R);

const lookupTree = <T>(i: number, t: Tree<T>): T =>
  (i === 0 && t instanceof Leaf ?
    t.value
  : (i < Math.floor(size(t) / 2) ?
    lookupTree(i, (<Node<T>>t).left)
  : lookupTree(
    i - Math.floor(size(t) / 2),
    (<Node<T>>t).right)));

export const lookup = <T>(i: number, R: RList<T>): T =>
  (isEmpty(R) ?
    raise('Subscript')
  : (R.head instanceof Zero ?
    lookup(i, R.tail)
  : (i < size(R.head.tree) ?
    lookupTree(i, R.head.tree)
  : lookup(
    i - size(R.head.tree),
    R.tail_))));

const updateTree = <T>(i: number, y: T, t: Tree<T>): Tree<T> =>
  (i === 0 && t instanceof Leaf ?
    new Leaf(y)
  : (t instanceof Leaf ?
    raise('Subscript')
  : (i < Math.floor(size(t) / 2) ?
    new Node(size(t), updateTree(i, y, t.left), t.right)
  : new Node(
    size(t),
    t.left,
    updateTree(i - Math.floor(size(t) / 2), y, t.right)))));

export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    raise('Subscript')
  : (R.head instanceof Zero ?
    consList(new Zero, update(i, y, R.tail))
  : (i < size(R.head.tree) ?
    consList(
      new One(updateTree(i, y, R.head.tree)),
      R.tail)
  : consList(
    R.head,
    update(i - size(R.head.tree), y, R.tail)))));
