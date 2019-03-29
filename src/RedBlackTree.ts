/*

Purely Functional Data Structures
=================================
Red-Black Tree
--------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { less, greater, Comparable } from './util';

enum Color { RED, BLACK };

export class RedBlackTree<T extends Comparable> {
  constructor(
    public readonly color: Color,
    public readonly value: T,
    public readonly left: RedBlackTree<T>,
    public readonly right: RedBlackTree<T>,
  ) {
    Object.freeze(this);
  }
}

export const EmptyTree = <RedBlackTree<any>>null;

export const isEmpty = (R: RedBlackTree<any>) => (R === EmptyTree);

const color = (R: RedBlackTree<any>): Color =>
  (isEmpty(R) ? Color.BLACK : R.color);

export const member = <T extends Comparable>(x: T, R: RedBlackTree<T>): boolean =>
  (isEmpty(R) ?
    false
  : (less(x, R.value) ?
    member(x, R.left)
  : (greater(x, R.value) ?
    member(x, R.right)
  : true)));

const balance =
  <T extends Comparable>(col: Color, x: T, left: RedBlackTree<T>,
    right: RedBlackTree<T>): RedBlackTree<T> =>
      (col === Color.RED ?
        new RedBlackTree(Color.RED, x, left, right)
      : (color(left) === Color.RED ?
        (color(left.left) === Color.RED ?
          new RedBlackTree(
            Color.RED,
            left.value,
            new RedBlackTree(
              Color.BLACK,
              left.left.value,
              left.left.left,
              left.left.right),
            new RedBlackTree(Color.BLACK, x, left.right, right))
        : (color(left.right) === Color.RED ?
          new RedBlackTree(
            Color.RED,
            left.right.value,
            new RedBlackTree(Color.BLACK, left.value, left.left, left.right.left),
            new RedBlackTree(
              Color.BLACK,
              x,
              left.right.right,
              right))
        : new RedBlackTree(Color.BLACK, x, left, right)))
      : (color(right) === Color.RED ?
        (color(right.left) === Color.RED ?
          new RedBlackTree(
            Color.RED,
            right.left.value,
            new RedBlackTree(
              Color.BLACK,
              x,
              left,
              right.left.left),
            new RedBlackTree(
              Color.BLACK,
              right.value,
              right.left.right,
              right.right))
        : (color(right.right) === Color.RED ?
          new RedBlackTree(
            Color.RED,
            right.value,
            new RedBlackTree(
              Color.BLACK,
              x,
              left,
              right.left),
            new RedBlackTree(
              Color.BLACK,
              right.right.value,
              right.right.left,
              right.right.right))
        : new RedBlackTree(Color.BLACK, x, left, right)))
      : new RedBlackTree(Color.BLACK, x, left, right))));

const ins = <T extends Comparable>(x: T, R: RedBlackTree<T>): RedBlackTree<T> =>
  (isEmpty(R) ?
    new RedBlackTree(Color.RED, x, EmptyTree, EmptyTree)
  : (less(x, R.value) ?
    balance(color(R), R.value, ins(x, R.left), R.right)
  : (greater(x, R.value) ?
    balance(color(R), R.value, R.left, ins(x, R.right))
  : R)));

export const insert = <T extends Comparable>(x: T, R: RedBlackTree<T>): RedBlackTree<T> => {
  let tmp = ins(x, R);
  return balance(Color.BLACK, tmp.value, tmp.left, tmp.right);
};
