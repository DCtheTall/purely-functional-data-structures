/*

Purely Functional Data Structures
=================================
Catenable List
--------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Queue,
  snoc,
  isEmpty as isEmptyQueue,
  EmptyQueue,
} from './RealTimeQueue';
import { Suspension, $ } from './util';

export class Cat<T> {
  constructor(
    public readonly value: T,
    public readonly queue: SuspendedCatQueue<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return this.value;
  }

  get tail(): Cat<T> {
    return linkAll(this.queue);
  }
}

type SuspendedCatQueue<T> = Queue<Suspension<Cat<T>>>;

export const EmptyCat = <Cat<any>>null;

export const isEmpty = (C: Cat<any>) => (C === EmptyCat);

const link = <T>(c: Cat<T>, cs: Suspension<Cat<T>>): Cat<T> =>
  new Cat(c.value, snoc(c.queue, cs));

const linkAll = <T>(Q: SuspendedCatQueue<T>): Cat<T> =>
  (isEmptyQueue(Q.tail) ?
    Q.head.force()
  : link(
    Q.head.force(),
    $(() => linkAll(Q.tail))));

export const concat = <T>(A: Cat<T>, B: Cat<T>): Cat<T> =>
  (isEmpty(A) ? B
  : (isEmpty(B) ? A
  : link(A, $(() => B))));

export const cons = <T>(x: T, C: Cat<T>): Cat<T> =>
  concat(new Cat(x, EmptyQueue), C);
