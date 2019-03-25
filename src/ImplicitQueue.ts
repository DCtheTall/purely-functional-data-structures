/*

Purely Functional Data Structures
=================================
Implicit Queue
--------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { $, Suspension, raise } from "./util";

class Zero {
  constructor() {
    Object.freeze(this);
  }
}

class One<T> {
  constructor(
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

type Tuple<T> = [T, T];

class Two<T> {
  constructor(
    public readonly value: Tuple<T>,
  ) {
    Object.freeze(this);
  }
}

type Digit<T> = Zero | One<T> | Two<T>;

class Shallow<T> {
  constructor(
    public readonly digit: Zero | One<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return head(this);
  }

  get tail(): Queue<T> {
    return tail(this);
  }
}

class Deep<T> {
  constructor(
    public readonly front: Digit<T>,
    public readonly qs: Suspension<Queue<Tuple<T>>>,
    public readonly rear: Zero | One<T>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return head(this);
  }

  get tail(): Queue<T> {
    return tail(this);
  }
}

export type Queue<T> = Shallow<T> | Deep<T>;

export const EmptyQueue = new Shallow(new Zero());

export const isEmpty = (Q: Queue<any>) =>
  (Q instanceof Shallow && Q.digit instanceof Zero);

export const snoc = <T>(Q: Queue<T>, x: T): Queue<T> =>
  (isEmpty(Q) ?
    new Shallow(new One(x))
  : (Q instanceof Shallow ?
    new Deep<T>(
      new Two([(<One<T>>Q.digit).value, x]),
      $(() => (<Queue<Tuple<T>>>EmptyQueue)),
      new Zero())
  : (Q.rear instanceof Zero ?
    new Deep(
      Q.front,
      Q.qs,
      new One(x))
  : new Deep<T>(
    Q.front,
    $(() => <Queue<Tuple<T>>>snoc(
      Q.qs.force(),
      [(<One<T>>Q.rear).value, x])),
    new Zero()))));

const head = <T>(Q: Queue<T>): T =>
  (isEmpty(Q) ?
    raise('EmptyQueue')
  : (Q instanceof Shallow ?
    (Q.digit instanceof One ?
      Q.digit.value
    : (<Two<T>>Q.digit).value[0])
  : (Q.front instanceof One ?
    Q.front.value
  : (<Two<T>>Q.front).value[0])));

const tail = <T>(Q: Queue<T>): Queue<T> => {
  if (isEmpty(Q))
    raise('EmptyQueue');
  if (Q instanceof Shallow)
    return <Queue<T>>EmptyQueue;
  if (Q.front instanceof Two)
    return new Deep(
      new One(Q.front.value[1]),
      Q.qs,
      Q.rear);
  if (isEmpty(Q.qs.force()))
    return new Shallow(Q.rear);
  return new Deep<T>(
    new Two(Q.qs.force().head),
    $(() => Q.qs.force().tail),
    Q.rear);
};
