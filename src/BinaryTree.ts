/*

Purely Functional Data Structures
=================================
Binary Tree
-----------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { recursive, call } from "tallstack";
import { less, greater } from './util';

export class BinaryTree<T> {
  constructor(
    public readonly value: T,
    public readonly left: BinaryTree<T>,
    public readonly right: BinaryTree<T>,
  ) {
    Object.freeze(this);
  }

  static create<T>(value: T, left: BinaryTree<T>, right: BinaryTree<T>) {
    return new BinaryTree(value, left, right);
  }
}

export const EmptyTree = <BinaryTree<any>>null;

export const isEmpty = (B: BinaryTree<any>) => (B === EmptyTree);

export const member = recursive(
  <T>(x: T, B: BinaryTree<T>): boolean =>
    ((!isEmpty(B)) &&
      (less(x, B.value) ?
        call(member, x, B.left)
      : (greater(x, B.value) ?
        call(member, x, B.right)
      : true))));

export const insert = recursive(
  <T>(x: T, B: BinaryTree<T>): BinaryTree<T> =>
    (isEmpty(B) ?
      new BinaryTree(x, EmptyTree, EmptyTree)
    : (less(x, B.value) ?
      call(
        BinaryTree.create,
        B.value,
        call(insert, x, B.left),
        B.right)
    : (greater(x, B.value) ?
      call(
        BinaryTree.create,
        B.value,
        B.left,
        call(insert, x, B.right))
    : B))));
