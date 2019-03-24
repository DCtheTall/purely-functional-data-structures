/*

Purely Functional Data Structures
=================================
Bootstrapped Queue
------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  reverse,
  EmptyList,
  isEmpty as isEmptyList,
  cons,
} from './List';
import { Suspension, $ } from './util';

export class Queue<T> {
  constructor(
    public readonly lenfm: number,
    public readonly front: List<T>,
    public readonly collection: Collection<T>,
    public readonly lenr: number,
    public readonly rear: List<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return this.front.head;
  }

  get tail(): Queue<T> {
    return checkQ(new Queue(
      this.lenfm - 1,
      this.front.tail,
      this.collection,
      this.lenr,
      this.rear));
  }
}

type Collection<T> = Queue<Suspension<List<T>>>;

export const EmptyQueue = <Queue<any>>null;

export const isEmpty = (Q: Queue<any>) => (Q === EmptyQueue);

const checkQ = <T>(Q: Queue<T>): Queue<T> =>
  (Q.lenr <= Q.lenfm ?
    checkF(Q)
  : checkF(new Queue(
    Q.lenfm + Q.lenr,
    Q.front,
    snoc(Q.collection, $(() => reverse(Q.rear))),
    0,
    EmptyList)));

const checkF = <T>(Q: Queue<T>): Queue<T> =>
  (isEmptyList(Q.front) && isEmpty(Q.collection) ?
    EmptyQueue
  : (isEmptyList(Q.front) ?
    new Queue(
      Q.lenfm,
      Q.collection.head.force(),
      Q.collection.tail,
      Q.lenr,
      Q.rear)
  : Q));

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  (isEmpty(Q) ?
    new Queue(1, cons(x, EmptyList), EmptyQueue, 0, EmptyList)
  : checkQ(new Queue(
    Q.lenfm,
    Q.front,
    Q.collection,
    Q.lenr + 1,
    cons(x, Q.rear))));
