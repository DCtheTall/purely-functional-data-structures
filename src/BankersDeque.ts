/*

Purely Functional Data Structures
=================================
Bankers Deque
-------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Stream,
  EmptyStream,
  take,
  concat,
  reverse as reverseStream,
  drop,
  cons as consStream,
} from './Stream';
import {raise} from './util';

export class Deque<T> {
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
      raise('EmptyDeque');
    if (this.fLen === 0)
      return this.rear.force().head;
    return this.front.force().head;
  }

  get tail(): Deque<T> {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (this.fLen === 0)
      return EmptyDeque;
    return check(new Deque(
      this.fLen - 1,
      this.front.force().tail,
      this.rLen,
      this.rear));
  }

  get last(): T {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (this.rLen === 0)
      return this.front.force().head;
    return this.rear.force().head;
  }

  get init(): Deque<T> {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (this.rLen === 0)
      return EmptyDeque;
    return check(new Deque(
      this.fLen,
      this.front,
      this.rLen - 1,
      this.rear.force().tail));
  }
}

export const EmptyDeque = new Deque(0, EmptyStream, 0, EmptyStream);

export const isEmpty = (D: Deque<any>) => ((D.fLen + D.rLen) === 0);

const check = <T>(D: Deque<T>): Deque<T> => {
  if (D.fLen > ((2 * D.rLen) + 1)) {
    let i = Math.floor((D.fLen + D.rLen) / 2);
    return new Deque(
      i,
      take(i, D.front),
      D.fLen + D.rLen - i,
      concat(
        D.rear,
        reverseStream(drop(i, D.front))));
  }
  if (D.rLen > ((2 * D.fLen) + 1)) {
    let i = Math.floor((D.fLen + D.rLen) / 2);
    return new Deque(
      D.fLen + D.rLen - i,
      concat(
        D.front,
        reverseStream(drop(i, D.rear))),
      i,
      take(i, D.rear));
  }
  return D;
};

export const cons = <T>(x: T, D: Deque<T>): Deque<T> =>
  check(new Deque(D.fLen + 1, consStream(x, D.front), D.rLen, D.rear));

export const snoc = <T>(D: Deque<T>, x: T): Deque<T> =>
  check(new Deque(D.fLen, D.front, D.rLen + 1, consStream(x, D.rear)));

export const reverse = <T>(D: Deque<T>): Deque<T> =>
  new Deque(D.rLen, D.rear, D.fLen, D.front);

