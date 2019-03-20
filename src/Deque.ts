/*

Purely Functional Data Structures
=================================
Deque
-----

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  EmptyList,
  isEmpty as isEmptyList,
  length,
  reverse,
  slice,
  cons as consList,
} from './List';
import { raise } from './util';

export class Deque<T> {
  constructor(
    public readonly left: List<T>,
    public readonly right: List<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyList(this.left))
      return this.right.head;
    return this.left.head;
  }

  get tail(): Deque<T> {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyList(this.left))
      return EmptyDeque;
    return new Deque(this.left.tail, this.right);
  }

  get last(): T {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyList(this.right))
      return this.left.head;
    return this.right.head;
  }

  get init(): Deque<T> {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyList(this.right))
      return EmptyDeque;
    return new Deque(this.left, this.right.tail);
  }
}

export const EmptyDeque = new Deque(EmptyList, EmptyList);

export const isEmpty = (D: Deque<any>) =>
  (isEmptyList(D.left) && isEmptyList(D.right));

const checkLeft = <T>(D: Deque<T>): Deque<T> => {
  if ((!isEmptyList(D.left)) || length(D.right) < 2)
    return D;
  let len = length(D.right);
  return new Deque(
    reverse(slice(D.right, Math.floor(len / 2), len)),
    slice(D.right, 0, Math.floor(len / 2)));
}

const checkRight = <T>(D: Deque<T>): Deque<T> => {
  if ((!isEmptyList(D.right)) || length(D.left) < 2)
    return D;
  let len = length(D.left);
  return new Deque(
    slice(D.left, 0, Math.floor(len / 2)),
    reverse(slice(D.left, Math.floor(len / 2), len)));
}

export const cons = <T>(x: T, D: Deque<T>): Deque<T> =>
  checkRight(new Deque(consList(x, D.left), D.right));

export const snoc = <T>(D: Deque<T>, x: T): Deque<T> =>
  checkLeft(new Deque(D.left, consList(x, D.right)));
