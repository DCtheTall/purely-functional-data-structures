/*

Purely Functional Data Structures
=================================
Hood-Melville Queue
-------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { List, EmptyList, cons, isEmpty as isEmptyList } from './List';
import { raise } from './util';

class RotationState<T> {
  constructor() {}
}

class Idle extends RotationState<any> {
  constructor() {
    super();
    Object.freeze(this);
  }
}

class Reversing<T> extends RotationState<T> {
  constructor(
    public readonly size: number,
    public readonly front1: List<T>,
    public readonly front2: List<T>,
    public readonly rear1: List<T>,
    public readonly rear2: List<T>,
  ) {
    super();
    Object.freeze(this);
  }
}

class Appending<T> extends RotationState<T> {
  constructor(
    public readonly size: number,
    public readonly front: List<T>,
    public readonly rear: List<T>,
  ) {
    super();
    Object.freeze(this);
  }
}

class Done<T> extends RotationState<T> {
  constructor(
    public readonly list: List<T>,
  ) {
    super();
    Object.freeze(this);
  }
}

export class Queue<T> {
  constructor(
    public readonly fLen: number,
    public readonly front: List<T>,
    public readonly state: RotationState<T>,
    public readonly rLen: number,
    public readonly rear: List<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    if (isEmpty(this))
      raise('EmptyQueue');
    return this.front.head;
  }

  get tail(): Queue<T> {
    if (isEmpty(this))
      raise('EmptyQueue');
    return check(new Queue(
      this.fLen - 1,
      this.front.tail,
      invalidate(this.state),
      this.rLen,
      this.rear));
  }
}

export const EmptyQueue = new Queue(0, EmptyList, new Idle(), 0, EmptyList);

export const isEmpty = (Q: Queue<any>) => (Q.fLen === 0);

const exec = <T>(rs: RotationState<T>): RotationState<T> => {
  if (rs instanceof Reversing) {
    let rev = <Reversing<T>>rs;
    if (isEmptyList(rev.front1))
      return new Appending(
        rev.size,
        rev.front2,
        cons(rev.rear1.head, rev.rear2)
      );
    return new Reversing(
      rev.size + 1,
      rev.front1.tail,
      cons(rev.front1.head, rev.front2),
      rev.rear1.tail,
      cons(rev.rear1.head, rev.rear2));
  }
  if (rs instanceof Appending) {
    let ap = <Appending<T>>rs;
    if (ap.size === 0) {
      return new Done(ap.rear);
    }
    return new Appending(
      ap.size - 1,
      ap.front.tail,
      cons(ap.front.head, ap.rear));
  }
  return rs;
}

const invalidate = <T>(rs: RotationState<T>): RotationState<T> => {
  if (rs instanceof Reversing) {
    let rev = <Reversing<T>>rs;
    return new Reversing(
      rev.size - 1,
      rev.front1,
      rev.front2,
      rev.rear1,
      rev.rear2);
  }
  if (rs instanceof Appending) {
    let ap = <Appending<T>>rs;
    if (ap.size === 0) {
      return new Done(ap.rear);
    }
    return new Appending(
      ap.size - 1,
      ap.front,
      ap.rear);
  }
  return rs;
}

const exec2 = <T>(Q: Queue<T>): Queue<T> => {
  let newState = exec(exec(Q.state));
  if (newState instanceof Done)
    return new Queue(
      Q.fLen,
      newState.list,
      Idle,
      Q.rLen,
      Q.rear);
  return new Queue(
    Q.fLen,
    Q.front,
    newState,
    Q.rLen,
    Q.rear);
}

const check = <T>(Q: Queue<T>): Queue<T> =>
  (Q.fLen < Q.rLen ?
    exec2(Q)
: new Queue(
  Q.fLen + Q.rLen,
  Q.front,
  new Reversing(
    0,
    Q.front,
    EmptyList,
    Q.rear,
    EmptyList),
  0,
  EmptyList));

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  check(new Queue(
    Q.fLen,
    Q.front,
    Q.state,
    Q.rLen + 1,
    cons(x, Q.rear)));

