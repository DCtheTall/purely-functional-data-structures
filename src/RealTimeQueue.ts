/*

Purely Functional Data Structures
=================================
Real Time Queue
---------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Stream,
  EmptyStream,
  isEmpty as isEmptyStream,
  cons as consStream,
  length as lengthStream,
} from './Stream';
import {
  List,
  EmptyList,
  cons as consList,
  length as lengthList,
} from './List';
import { raise } from './util';

export class Queue<T> {
  constructor(
    public readonly front: Stream<T>,
    public readonly rear: List<T>,
    public readonly schedule: Stream<T>,
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
    return exec(
      this.front.force().tail,
      this.rear,
      this.schedule);
  }
}

export const EmptyQueue =
  new Queue(EmptyStream, EmptyList, EmptyStream);

export const isEmpty = (Q: Queue<any>) => isEmptyStream(Q.front);

const rotate =
  <T>(front: Stream<T>, rear: List<T>, schedule: Stream<T>): Stream<T> =>
    (isEmptyStream(front) ?
      consStream(rear.head, schedule)
    : consStream(
      front.force().head,
      rotate(
        front.force().tail,
        rear.tail,
        consStream(rear.head, schedule))));

const exec = <T>(front: Stream<T>, rear: List<T>, schedule: Stream<T>): Queue<T> => {
  if (isEmptyStream(schedule)) {
    let newFront = rotate(front, rear, EmptyStream);
    return new Queue(newFront, EmptyList, newFront);
  }
  return new Queue(front, rear, schedule.force().tail);
}

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  exec(Q.front, consList(x, Q.rear), Q.schedule);

export const size = (Q: Queue<any>): number =>
  ((2 * lengthList(Q.rear)) + lengthStream(Q.schedule));
