/*

Purely Functional Data Structures
=================================
Binary Tree
-----------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { less, greater, Comparable } from './util';

export class BinaryTree<T extends Comparable> {
  constructor(
    public readonly value: T,
    public readonly left: BinaryTree<T>,
    public readonly right: BinaryTree<T>,
  ) {
    Object.freeze(this);
  }
}

export const EmptyTree = <BinaryTree<any>>null;

export const isEmpty = (B: BinaryTree<any>) => (B === EmptyTree);

export const member =
  <T extends Comparable>(x: T, B: BinaryTree<T>): boolean =>
    ((!isEmpty(B)) &&
      (less(x, B.value) ?
        member(x, B.left)
      : (greater(x, B.value) ?
        member(x, B.right)
      : true)));

export const insert =
  <T extends Comparable>(x: T, B: BinaryTree<T>): BinaryTree<T> =>
    (isEmpty(B) ?
      new BinaryTree(x, EmptyTree, EmptyTree)
    : (less(x, B.value) ?
      new BinaryTree(
        B.value,
        insert(x, B.left),
        B.right)
    : (greater(x, B.value) ?
      new BinaryTree(
        B.value,
        B.left,
        insert(x, B.right))
    : B)));
