/*

Purely Functional Data Structures
=================================
Batched Queue
-------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { raise } from './util';
import { List, EmptyList, isEmpty as isEmptyList, reverse, cons } from './List';

export class Queue<T> {
  constructor(
    public readonly left: List<T>,
    public readonly right: List<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (isEmptyList(this.left))
      raise('EmptyQueue');
    return this.left.head;
  }

  get tail(): Queue<T> {
    if (isEmptyList(this.left))
      raise('EmptyQueue');
    return check(new Queue(this.left.tail, this.right));
  }
}

export const EmptyQueue = new Queue(EmptyList, EmptyList);

export const isEmpty = (Q: Queue<any>) =>
  (isEmptyList(Q.left) && isEmptyList(Q.right));

const check = <T>(Q: Queue<T>): Queue<T> =>
  (isEmptyList(Q.left) ?
    new Queue(reverse(Q.right), EmptyList)
  : Q);

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  check(new Queue(Q.left, cons(x, Q.right)));
