/*

Purely Functional Data Structures
=================================
Skew Binary Random Access List
------------------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { raise } from './util';

class Ancestor<T> {
  constructor(
    public readonly value: T,
    public readonly left: TreeNode<T>,
    public readonly right: TreeNode<T>,
  ) {
    Object.freeze(this);
  }
}

class Leaf<T> {
  constructor (
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

type TreeNode<T> = Leaf<T> | Ancestor<T>;

class ListElement<T> {
  constructor(
    public readonly size: number,
    public readonly tree: TreeNode<T>,
  ) {
    Object.freeze(this);
  }
}

export class RList<T> {
  constructor(
    public readonly head_: ListElement<T>,
    public readonly tail_: RList<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return this.head_.tree.value;
  }

  get tail(): RList<T> {
    if (this.head instanceof Leaf)
      return this.tail;
    new RList(
      new ListElement(
        this.head_.size >> 1,
        (<Ancestor<T>>this.head_.tree).left),
      new RList(
        new ListElement(
          this.head_.size >> 1,
          (<Ancestor<T>>this.head_.tree).right),
        this.tail_));
  }
}

export const EmptyRList = <RList<any>>null;

export const isEmpty = (R: RList<any>) => (R === EmptyRList);

export const cons = <T>(x: T, R: RList<T>): RList<T> =>
  (isEmpty(R) || isEmpty(R.tail_) ?
    new RList(new ListElement(1, new Leaf(x)), R)
  : (this.head_.size === this.tail_.head_.size ?
    new RList(
      new ListElement(
        (2 * this.head_.size) + 1,
        new Ancestor(
          x,
          this.head_.tree,
          this.tail_.head_.tree)),
      R.tail_.tail_)
  : new RList(new ListElement(1, new Leaf(x)), R)));

const lookupTree = <T>(w: number, i: number, node: TreeNode<T>): T =>
  ((node instanceof Leaf) && (i !== 0) ?
    raise('Subscript')
  : (i === 0 ?
      node.value
  : (i <= (w >> 1) ?
    lookupTree(w >> 1, i - 1, (<Ancestor<T>>node).left)
  : lookupTree(
    w >> 1,
    i - 1 - (w >> 1),
    (<Ancestor<T>>node).right))));

const updateTree = <T>(w: number, i: number, y: T, node: TreeNode<T>): TreeNode<T> =>
  ((node instanceof Leaf) && (i !== 0) ?
    raise('Subscript')
  : ((node instanceof Leaf) && (i === 0) ?
    new Leaf(y)
  : (i === 0 ?
    new Ancestor(
      y,
      updateTree(w >> 1, i - 1, y, (<Ancestor<T>>node).left),
      (<Ancestor<T>>node).right)
  : new Ancestor(
    node.value,
    (<Ancestor<T>>node).left,
    updateTree(
      w >> 1,
      i - (w >> 1),
      y,
      (<Ancestor<T>>node).right)))));

export const lookup = <T>(i: number, R: RList<T>): T =>
  (isEmpty(R) ?
    raise('Subscript')
  : (R.head_.size < i ?
    lookupTree(R.head_.size, i, R.head_.tree)
  : lookup(i - R.head_.size, R.tail_)));

export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    raise('Subscript')
  : (R.head_.size < i ?
    new RList(
      new ListElement(
        R.head_.size,
        updateTree(R.head_.size, i, y, R.head_.tree)),
      R.tail_)
  : new RList(
    R.head_,
    update(i - R.head_.size, y, R.tail_))));
