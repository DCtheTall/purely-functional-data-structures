/*

Purely Functional Data Structures
=================================
Bankers Queue
-------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { Stream, EmptyStream, isEmpty as isEmptyStream, concat, reverse, cons } from './Stream';
import { raise } from './util';

export class Queue<T> {
  constructor(
    public readonly fLen: number,
    public readonly front: Stream<T>,
    public readonly rLen: number,
    public readonly rear: Stream<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (isEmpty(this))
      raise('EmptyQueue');
    return this.front.force().head;
  }

  get tail(): Queue<T> {
    if (isEmpty(this))
      raise('EmptyQueue');
    return check(new Queue(
      this.fLen - 1,
      this.front.force().tail,
      this.rLen,
      this.rear));
  }
}

export const EmptyQueue = new Queue(0, EmptyStream, 0, EmptyStream);

export const isEmpty = (Q: Queue<any>) => isEmptyStream(Q.front);

const check = <T>(Q: Queue<T>): Queue<T> =>
  (isEmpty(Q) ?
    raise('EmptyQueue')
  : (Q.rLen <= Q.fLen) ?
    Q
  : new Queue(
    Q.fLen + Q.rLen,
    concat(Q.front, reverse(Q.rear)),
    0,
    EmptyStream));

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  check(new Queue(Q.fLen, Q.front, Q.rLen, cons(x, Q.rear)));

