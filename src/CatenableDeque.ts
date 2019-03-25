/*

Purely Functional Data Structures
=================================
Catenable Deque
---------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  Deque,
  EmptyDeque,
  isEmpty as isEmptyDeque,
  cons as consDeque,
  snoc as snocDeque,
  size,
} from './RealTimeDeque';
import { $, Suspension, raise } from './util';

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
    public readonly f: Deque<T>,
    public readonly a: Suspension<Cat<CmpdElement<T>>>,
    public readonly m: Deque<T>,
    public readonly b: Suspension<Cat<CmpdElement<T>>>,
    public readonly r: Deque<T>,
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

class Simple<T> {
  constructor(
    public readonly deque: Deque<T>,
  ) {
    Object.freeze(this);
  }
}

class Compound<T> {
  constructor(
    public readonly f: Deque<T>,
    public readonly m: Suspension<Cat<CmpdElement<T>>>,
    public readonly r: Deque<T>,
  ) {
    Object.freeze(this);
  }
}

type CmpdElement<T> = Simple<T> | Compound<T>;

export const EmptyCat = new Shallow(EmptyDeque);

export const isEmpty = (C: Cat<any>) =>
  (C instanceof Shallow && isEmptyDeque(C.deque));

export const cons = <T>(x: T, C: Cat<T>): Cat<T> =>
  (C instanceof Shallow ?
    new Shallow(consDeque(x, C.deque))
  : new Deep(consDeque(x, C.f), C.a, C.m, C.b, C.r));

export const snoc = <T>(C: Cat<T>, x: T): Cat<T> =>
  (C instanceof Shallow ?
    new Shallow(snocDeque(C.deque, x))
  : new Deep(C.f, C.a, C.m, C.b, snocDeque(C.r, x)));

const head = <T>(C: Cat<T>): T =>
  (isEmpty(C) ?
    raise('EmptyCat')
  : (C instanceof Shallow ?
    C.deque.head
  : C.f.head));

const last = <T>(C: Cat<T>): T =>
  (isEmpty(C) ?
    raise('EmptyCat')
  : (C instanceof Shallow ?
    C.deque.last
  : C.r.last));

const share = <T>(f: Deque<T>, r: Deque<T>): [Deque<T>, Deque<T>, Deque<T>] => {
  let m = consDeque(f.last, consDeque(r.head, EmptyDeque));
  return [f.init, m, r.tail];
}

const dappendL = <T>(f: Deque<T>, r: Deque<T>): Deque<T> =>
  (isEmptyDeque(f) ? r
  : dappendL(f.init, consDeque(f.last, r)));

const dappendR = <T>(f: Deque<T>, r: Deque<T>): Deque<T> =>
  (isEmptyDeque(r) ? f
  : dappendR(snocDeque(f, r.head), r.tail));

export const concat = <T>(C1: Cat<T>, C2: Cat<T>): Cat<T> => {
  if (C1 instanceof Shallow && C2 instanceof Shallow) {
    if (size(C1.deque) < 4)
      return new Shallow(dappendL(C1.deque, C2.deque));
    if (size(C2.deque) < 4)
      return new Shallow(dappendR(C1.deque, C2.deque));
    let [f, m, r] = share(C1.deque, C2.deque);
    return new Deep(f, $(() => EmptyCat), m, $(() => EmptyCat), r);
  }
  if (C1 instanceof Shallow) {
    let D = <Deep<T>>C2;
    if (size(C1.deque) < 4)
      return new Deep(dappendL(C1.deque, D.f), D.a, D.m, D.b, D.r);
    return new Deep(
      C1.deque,
      $(() => cons(new Simple(D.f), D.a.force())),
      D.m,
      D.b,
      D.r);
  }
  if (C2 instanceof Shallow) {
    let D = <Deep<T>>C1;
    if (size(C2.deque) < 4)
      return new Deep(D.f, D.a, D.m, D.b, dappendR(D.r, C2.deque));
    return new Deep(
      D.f,
      D.a,
      D.m,
      $(() => snoc(D.b.force(), new Simple(D.r))),
      C2.deque);
  }
  let [rprime, m, fprime] = share(C1.r, C2.f);
  let aprime = $(() =>
    snoc(C1.a.force(), new Compound(C1.m, C1.b, rprime)));
  let bprime = $(() =>
    cons(new Compound(fprime, C2.a, C2.m), C2.b.force()));
  return new Deep(C1.f, aprime, m, bprime, C2.r);
}

const replaceHead = <T>(x: T, C: Cat<T>): Cat<T> =>
  (C instanceof Shallow ?
    new Shallow(consDeque(x, C.deque.tail))
  : new Deep(consDeque(x, C.f.tail), C.a, C.m, C.b, C.r));

const replaceLast = <T>(x: T, C: Cat<T>): Cat<T> =>
  (C instanceof Shallow ?
    new Shallow(snocDeque(C.deque.init, x))
  : new Deep(C.f, C.a, C.m, C.b, snocDeque(C.r.init, x)));

const tail = <T>(C: Cat<T>): Cat<T> => {
  if (isEmpty(C))
    raise('EmptyCat');
  if (C instanceof Shallow)
    return new Shallow(C.deque.tail);
  if (size(C.f) > 3)
    return new Deep(C.f.tail, C.a, C.m, C.b, C.r);
  if (!isEmpty(C.a.force())) {
    if (C.a.force().head instanceof Simple) {
      let s = <Simple<T>>C.a.force().head;
      let fprime = dappendL(C.f.tail, s.deque.tail);
      return new Deep(
        fprime,
        $(() => C.a.force().tail),
        C.m,
        C.b,
        C.r);
    }
    let cmpd = <Compound<T>>C.a.force().head;
    let fprime = dappendL(C.f.tail, cmpd.f);
    let aprime = $(() => concat(
      cmpd.m.force(),
      replaceHead(
        new Simple(cmpd.r),
        C.a.force())));
    return new Deep(fprime, aprime, C.m, C.b, C.r);
  }
  if (!isEmpty(C.b.force())) {
    if (C.b.force().head instanceof Simple) {
      let s = <Simple<T>>C.b.force().head;
      let fprime = dappendL(C.f.tail, C.m);
      return new Deep(
        fprime,
        $(() => EmptyCat),
        s.deque,
        $(() => C.b.force().tail),
        C.r);
    }
    let cmpd = <Compound<T>>C.b.force().head;
    let fprime = dappendL(C.f.tail, C.m);
    let aprime = $(() => cons(
      new Simple(cmpd.f),
      cmpd.m.force()));
    return new Deep(
      fprime,
      aprime,
      cmpd.r,
      $(() => C.b.force().tail),
      C.r);
  }
  return concat(
    new Shallow(dappendL(C.f.tail, C.m)),
    new Shallow(C.r));
}

const init = <T>(C: Cat<T>): Cat<T> => {
  if (isEmpty(C))
    raise('EmptyCat');
  if (C instanceof Shallow)
    return new Shallow(C.deque.init);
  if (size(C.f) > 3)
    return new Deep(C.f, C.a, C.m, C.b, C.r.init);
  if (!isEmpty(C.b.force())) {
    if (C.b.force().head instanceof Simple) {
      let s = <Simple<T>>C.b.force().head;
      let rprime = dappendR(s.deque.init, C.r.init);
      return new Deep(
        C.f,
        C.a,
        C.m,
        $(() => C.b.force().tail),
        rprime);
    }
    let cmpd = <Compound<T>>C.b.force().head;
    let rprime = dappendR(cmpd.r, C.r.init);
    let bprime = $(() => concat(
      replaceLast(
        new Simple(cmpd.f),
        C.b.force()),
      cmpd.m.force()));
    return new Deep(C.f, C.a, C.m, bprime, rprime);
  }
  if (!isEmpty(C.a.force())) {
    if (C.a.force().head instanceof Simple) {
      let s = <Simple<T>>C.a.force().head;
      let rprime = dappendR(C.m, C.r.init);
      return new Deep(
        C.f,
        $(() => C.a.force().init),
        s.deque,
        $(() => EmptyCat),
        rprime);
    }
    let cmpd = <Compound<T>>C.a.force().head;
    let rprime = dappendR(C.m, C.r.init);
    let bprime = $(() => snoc(
      cmpd.m.force(),
      new Simple(cmpd.r)));

    return new Deep(
      C.f,
      $(() => C.a.force().tail),
      cmpd.f,
      bprime,
      rprime);
  }
  return concat(
    new Shallow(C.f),
    new Shallow(dappendR(C.m, C.r.init)));
}
