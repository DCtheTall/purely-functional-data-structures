/*

Purely Functional Data Structures
=================================
Sparse Binary Random Access List
--------------------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { raise } from "./util";

class Leaf<T> {
  constructor(
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

class Ancestor<T> {
  constructor(
    public readonly size: number,
    public readonly left: TreeNode<T>,
    public readonly right: TreeNode<T>,
  ) {
    Object.freeze(this);
  }
}

type TreeNode<T> = Leaf<T> | Ancestor<T>;

export class RList<T> {
  constructor(
    public readonly head_: TreeNode<T>,
    public readonly tail_: RList<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return (<Leaf<T>>unconsTree(this)[0]).value;
  }

  get tail(): RList<T> {
    return unconsTree(this)[1];
  }
}

const size = (T: TreeNode<any>) =>
  (T instanceof Leaf ? 1 : T.size);

export const EmptyRList = <RList<any>>null;

export const isEmpty = (R: RList<any>) => (R === EmptyRList);

const link = <T>(A: TreeNode<T>, B: TreeNode<T>): Ancestor<T> =>
  new Ancestor(size(A) + size(B), A, B);

const consTree = <T>(t: TreeNode<T>, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    new RList(t, EmptyRList)
  : (size(t) < size(R.head_) ?
    new RList(t, R)
  : consTree(
    link(t, R.head_),
    R.tail_)));

const unconsTree = <T>(R: RList<T>): [TreeNode<T>, RList<T>] => {
  if (isEmpty(R))
    raise('EmptyRList');
  if (size(R.head_) === 1)
    return [R.head_, R.tail_];
  let [first, second] = unconsTree(R.tail_);
  return [(<Ancestor<T>>first).left,
    new RList((<Ancestor<T>>first).right, second)];
};

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
  : (i < size(R.head_) ?
    lookupTree(i, R.head_)
  : lookup(i - size(R.head_), R.tail_)));

const updateTree = <T>(i: number, y: T, t: TreeNode<T>): TreeNode<T> =>
  (i == 0 && t instanceof Leaf ?
    new Leaf(y)
  : (t instanceof Leaf ?
    raise('Subscript')
  : (i < (size(t) >> 1) ?
    new Ancestor(
      t.size,
      updateTree(i, y, t.left),
      t.right)
  : new Ancestor(
    t.size,
    t.left,
    updateTree(i - (size(t) >> 1), y, t.right)))));

export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    raise('Subscript')
  : (i < size(R.head_) ?
    new RList(updateTree(i, y, R.head_), R.tail_)
  : new RList(
    R.head_,
    update(i - size(R.head_), y, R.tail_))));
