/*

Purely Functional Data Structures
=================================
Zeroless Binary Random Access List
----------------------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { raise } from './util';

class Leaf<T> {
  constructor(
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

class Ancestor<T> {
  constructor (
    public readonly size: number,
    public readonly left: TreeNode<T>,
    public readonly right: TreeNode<T>,
  ) {
    Object.freeze(this);
  }
}

type TreeNode<T> = Leaf<T> | Ancestor<T>;

const size = (T: TreeNode<any>) =>
  (T instanceof Leaf ? 1 : T.size);

class One<T> {
  constructor(
    public readonly tree: TreeNode<T>,
  ) {
    Object.freeze(this);
  }
}

class Two<T> {
  constructor(
    public readonly tree: TreeNode<T>,
  ) {
    Object.freeze(this);
  }
}

type Digit<T> = One<T> | Two<T>;

export class RList<T> {
  constructor(
    public readonly head_: Digit<T>,
    public readonly tail_: RList<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (this.head_ instanceof One)
      return (<Leaf<T>>this.head_.tree).value;
    return (<Leaf<T>>(<Ancestor<T>>this.head_.tree).left).value;
  }

  get tail(): RList<T> {
    return unconsTree(this)[1];
  }
}

export const EmptyRList = <RList<any>>null;

export const isEmpty = (R: RList<any>) => (R === EmptyRList);

const link = <T>(A: TreeNode<T>, B: TreeNode<T>): Ancestor<T> =>
  new Ancestor(size(A) + size(B), A, B);

const consTree = <T>(t: TreeNode<T>, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    new RList(new One(t), R)
  : (R.head_ instanceof One ?
    new RList(
      new Two(link(t, R.head_.tree)),
      R.tail_)
  : new RList(
    new One(t),
    consTree(R.head_.tree, R.tail_))));

const unconsTree = <T>(R: RList<T>): [TreeNode<T>, RList<T>] => {
  if (isEmpty(R))
    raise('EmptyRList');
  if (R.head_ instanceof Two)
    return [(<Ancestor<T>>R.head_.tree).left, R.tail_];
  if (R.head_ instanceof One && isEmpty(R.tail_))
    return [R.head_.tree, EmptyRList];
  let [first, second] = unconsTree(R.tail_);
  return [R.head_.tree, new RList(new Two(first), second)];
}

export const cons = <T>(x: T, R: RList<T>): RList<T> =>
  consTree(new Leaf(x), R);

const lookupTree = <T>(i: number, t: TreeNode<T>): T =>
  (i === 0 && t instanceof Leaf ?
    t.value
  : (i < (size(t) >> 1) ?
    lookupTree(i, (<Ancestor<T>>t).left)
  : lookupTree(
    i - (size(t) >> 1),
    (<Ancestor<T>>t).right)));

export const lookup = <T>(i: number, R: RList<T>): T =>
  (isEmpty(R) ?
    raise('Subscript')
  : (i < size(R.head_.tree) ?
    lookupTree(i, R.head_.tree)
  : lookup(i - size(R.head_.tree), R.tail_)));

const updateTree = <T>(i: number, y: T, t: TreeNode<T>): TreeNode<T> =>
  (i === 0 && t instanceof Leaf ?
    new Leaf(y)
  : (t instanceof Leaf ?
    raise('Subscript')
  : (i < (size(t) >> 1) ?
    new Ancestor(
      size(t),
      updateTree(i, y, t.left),
      t.right)
  : new Ancestor(
    size(t),
    t.left,
    updateTree(i - (size(t) >> 1), y, t.right)))));

export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    raise('Subscript')
  : (i < size(R.head_.tree) ?
    (R.head_ instanceof One ?
      new RList(
        new One(updateTree(i, y, R.head_.tree)),
        R.tail_)
    : new RList(
      new Two(updateTree(i, y, R.head_.tree)),
      R.tail_))
  : new RList(
      R.head_,
      update(i - size(R.head_.tree), y, R.tail_))));
