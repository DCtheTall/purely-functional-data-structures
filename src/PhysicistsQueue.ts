/*

Purely Functional Data Structures
=================================
Physicists Queue
----------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  EmptyList,
  isEmpty as isEmptyList,
  concat,
  reverse,
  cons,
} from './List';
import { Suspension, $, raise } from './util';

export class Queue<T> {
  constructor(
    public readonly working: List<T>,
    public readonly fLen: number,
    public readonly front: Suspension<List<T>>,
    public readonly rLen: number,
    public readonly rear: List<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (isEmptyList(this.working))
      raise('EmptyQueue');
    return this.working.head;
  }

  get tail(): Queue<T> {
    if (isEmptyList(this.working))
      raise('EmptyQueue');
    return check(new Queue(
      this.working.tail,
      this.fLen - 1,
      $(() => this.front.force().tail),
      this.rLen,
      this.rear));
  }
}

export const EmptyQueue =
  new Queue(EmptyList, 0, $(() => EmptyList), 0, EmptyList);

export const isEmpty = (Q: Queue<any>) => (Q.fLen === 0);

const checkw = <T>(Q: Queue<T>): Queue<T> =>
  (isEmptyList(Q.working) ?
    new Queue(Q.front.force(), Q.fLen, Q.front, Q.rLen, Q.rear)
  : Q);

const check = <T>(Q: Queue<T>): Queue<T> =>
  (Q.rLen <= Q.fLen ?
    checkw(Q)
  : checkw(new Queue(
    Q.front.force(),
    Q.fLen + Q.rLen,
    $(() => concat(Q.front.force(), reverse(Q.rear))),
    0,
    EmptyList)));

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  check(new Queue(
    Q.working,
    Q.fLen,
    Q.front,
    Q.rLen + 1,
    cons(x, Q.rear)));
