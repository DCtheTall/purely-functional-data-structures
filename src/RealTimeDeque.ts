/*

Purely Functional Data Structures
=================================
Hood-Melville Queue
-------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Stream,
  EmptyStream,
  isEmpty as isEmptyStream,
  concat,
  reverse as reverseStream,
  cons as consStream,
  drop,
  take,
} from './Stream';
import {raise} from './util';

export class Deque<T> {
  constructor(
    public readonly fLen: number,
    public readonly front: Stream<T>,
    public readonly fSchedule: Stream<T>,
    public readonly rLen: number,
    public readonly rear: Stream<T>,
    public readonly rSchedule: Stream<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyStream(this.front))
      return this.rear.force().head;
    return this.front.force().head;
  }

  get tail(): Deque<T> {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyStream(this.front))
      return EmptyDeque;
    return check(new Deque(
      this.fLen - 1,
      this.front.force().tail,
      exec2(this.fSchedule),
      this.rLen,
      this.rear,
      exec2(this.rSchedule)));
  }

  get last(): T {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyStream(this.rear))
      return this.front.force().head;
    return this.rear.force().head;
  }

  get init(): Deque<T> {
    if (isEmpty(this))
      raise('EmptyDeque');
    if (isEmptyStream(this.rear))
      return EmptyDeque;
    return check(new Deque(
      this.fLen,
      this.front,
      exec2(this.fSchedule),
      this.rLen - 1,
      this.rear.force().tail,
      exec2(this.rSchedule)));
  }
}

export const EmptyDeque = new Deque(
  0, EmptyStream, EmptyStream, 0, EmptyStream, EmptyStream);

export const isEmpty = (D: Deque<any>) => ((D.fLen + D.rLen) === 0);

const exec1 = <T>(S: Stream<T>): Stream<T> =>
  (isEmptyStream(S) ? S : S.force().tail);

const exec2 = <T>(S: Stream<T>): Stream<T> => exec1(exec1(S));

const rotateRev = <T>(front: Stream<T>, rear: Stream<T>, acc: Stream<T>): Stream<T> =>
  (isEmptyStream(front) ?
    concat(reverseStream(rear), acc)
  : consStream(
    front.force().head,
    rotateRev(
      front.force().tail,
      drop(2, rear),
      concat(take(2, rear), acc))));

const rotateDrop = <T>(front: Stream<T>, j: number, rear: Stream<T>): Stream<T> =>
  (j < 2 ?
    rotateRev(front, drop(j, rear), EmptyStream)
  : consStream(
    front.force().head,
    rotateDrop(
      front.force().tail,
      j - 2,
      drop(2, rear))));

const check = <T>(D: Deque<T>): Deque<T> => {
  if (D.fLen > ((2 * D.rLen) + 1)) {
    let i = Math.floor((D.fLen + D.rLen) / 2);
    let f = take(i, D.front);
    let r = rotateDrop(D.rear, i, D.front);
    return new Deque(i, f, f, D.fLen + D.rLen - i, r, r);
  }
  if (D.rLen > ((2 * D.fLen) + 1)) {
    let i = Math.floor((D.fLen + D.rLen) / 2);
    let f = rotateDrop(D.front, i, D.rear);
    let r = take(i, D.rear);
    return new Deque(D.fLen + D.rLen - i, f, f, i, r, r);
  }
  return D;
}

export const cons = <T>(x: T, D: Deque<T>): Deque<T> =>
  check(new Deque(
    D.fLen + 1,
    consStream(x, D.front),
    exec1(D.fSchedule),
    D.rLen,
    D.rear,
    exec1(D.rSchedule)));

export const snoc = <T>(D: Deque<T>, x: T): Deque<T> =>
  check(new Deque(
    D.fLen,
    D.front,
    exec1(D.fSchedule),
    D.rLen + 1,
    consStream(x, D.rear),
    exec1(D.rSchedule)));

export const reverse = <T>(D: Deque<T>): Deque<T> =>
  new Deque(D.rLen, D.rear, D.rSchedule, D.fLen, D.front, D.fSchedule);

export const size = (D: Deque<any>) => (D.fLen + D.rLen);

