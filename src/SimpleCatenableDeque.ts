/*

Purely Functional Data Structures
=================================
Simple Catenable Deque
----------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Deque,
  isEmpty as isEmptyDeque,
  cons as consDeque,
  snoc as snocDeque,
  EmptyDeque,
} from './RealTimeDeque';
import { $, Suspension, raise } from './util';

const tooSmall = (D: Deque<any>) =>
  (isEmptyDeque(D) || isEmptyDeque(D.tail));

const dappendL = <T>(f: Deque<T>, r: Deque<T>): Deque<T> =>
  (isEmptyDeque(f) ? r : consDeque(f.last, r));

const dappendR = <T>(f: Deque<T>, r: Deque<T>): Deque<T> =>
  (isEmptyDeque(r) ? f : snocDeque(f, r.head));

class Shallow<T> {
  constructor(
    public readonly deque: Deque<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return head(this);
  }

  get last(): T {
    return last(this);
  }

  get tail(): Cat<T> {
    return tail(this);
  }

  get init(): Cat<T> {
    return init(this);
  }
}

class Deep<T> {
  constructor(
    public readonly front: Deque<T>,
    public readonly middle: Suspension<Cat<Deque<T>>>,
    public readonly rear: Deque<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return head(this);
  }

  get last(): T {
    return last(this);
  }

  get tail(): Cat<T> {
    return tail(this);
  }

  get init(): Cat<T> {
    return init(this);
  }
}

export type Cat<T> = Shallow<T> | Deep<T>;

export const EmptyCat = new Shallow(EmptyDeque);

export const isEmpty = (C: Cat<any>) =>
  (C instanceof Shallow && isEmptyDeque(C.deque));

export const cons = <T>(x: T, C: Cat<T>): Cat<T> =>
  (C instanceof Shallow ?
    new Shallow(consDeque(x, C.deque))
  : new Deep(consDeque(x, C.front), C.middle, C.rear));

export const snoc = <T>(C: Cat<T>, x: T): Cat<T> =>
  (C instanceof Shallow ?
    new Shallow(snocDeque(C.deque, x))
  : new Deep(C.front, C.middle, snocDeque(C.rear, x)));

const head = <T>(C: Cat<T>): T =>
  (isEmpty(C) ?
    raise('EmptyCat')
  : (C instanceof Shallow ?
    C.deque.head
  : C.front.head));

const last = <T>(C: Cat<T>): T =>
  (isEmpty(C) ?
    raise('EmptyCat')
  : (C instanceof Shallow ?
    C.deque.last
  : C.rear.last));

const tail = <T>(C: Cat<T>): Cat<T> => {
  if (isEmpty(C))
    raise('EmptyCat');
  if (C instanceof Shallow)
    return new Shallow(C.deque.tail);
  let fprime = C.front.tail;
  if (!tooSmall(fprime))
    return new Deep(fprime, C.middle, C.rear);
  if (isEmpty(C.middle.force()))
    return new Shallow(dappendL(fprime, C.rear));
  return new Deep(
    dappendL(fprime, C.middle.force().head),
    $(() => C.middle.force().tail),
    C.rear);
};

const init = <T>(C: Cat<T>): Cat<T> => {
  if (isEmpty(C))
    raise('EmptyCat');
  if (C instanceof Shallow)
    return new Shallow(C.deque.init);
  let rprime = C.rear.init;
  if (!tooSmall(rprime))
    return new Deep(C.front, C.middle, rprime);
  if (isEmpty(C.middle.force()))
    return new Shallow(dappendR(C.front, rprime));
  return new Deep(
    C.front,
    $(() => C.middle.force().init),
    dappendR(C.middle.force().last, rprime));
};

export const concat = <T>(C1: Cat<T>, C2: Cat<T>): Cat<T> =>
  (C1 instanceof Shallow && C2 instanceof Shallow ?
    (tooSmall(C1.deque) ?
      new Shallow(dappendL(C1.deque, C2.deque))
    : (tooSmall(C2.deque) ?
      new Shallow(dappendR(C1.deque, C2.deque))
    : new Deep(
      C1.deque,
      $(() => EmptyCat),
      C2.deque)))
  : (C1 instanceof Shallow && C2 instanceof Deep ?
    (tooSmall(C1.deque) ?
      new Deep(dappendL(C1.deque, C2.front), C2.middle, C2.rear)
    : new Deep(
      C1.deque,
      $(() => cons(C2.front, C2.middle.force())),
      C2.rear))
  : (C1 instanceof Deep && C2 instanceof Shallow ?
    (tooSmall(C2.deque) ?
      new Deep(C1.front, C1.middle, dappendR(C1.rear, C2.deque))
    : new Deep(
      C1.front,
      $(() => snoc(C1.middle.force(), C1.rear)),
      C2.deque))
  : new Deep(
    (<Deep<T>>C1).front,
    $(() => concat(
      snoc((<Deep<T>>C1).middle.force(), (<Deep<T>>C1).rear),
      cons((<Deep<T>>C2).front, (<Deep<T>>C2).middle.force()))),
    (<Deep<T>>C2).rear))));
