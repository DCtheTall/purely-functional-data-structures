import { raise } from "./util";

/*

Purely Functional Data Structures
=================================
Alt Binary Random Access List
-----------------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

class Zero<T> {
  constructor(
    public readonly rlist: RList<[T, T]>,
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return uncons(this)[0];
  }

  get tail(): RList<T> {
    return uncons(this)[1];
  }
}

class One<T> {
  constructor(
    public readonly value: T,
    public readonly rlist: RList<[T, T]>
  ) {
    Object.freeze(this);
  }

  get head(): T {
    return uncons(this)[0];
  }

  get tail(): RList<T> {
    return uncons(this)[1];
  }
}

export type RList<T> = Zero<T> | One<T>;

export const EmptyRList = <RList<any>>null;

export const isEmpty = (R: RList<any>) => (R === EmptyRList);

export const cons = <T>(x: T, R: RList<T>): RList<T> =>
  (isEmpty(R) ?
    new One(x, EmptyRList)
  : (R instanceof Zero ?
    new One(x, R.rlist)
  : new Zero(cons(<[T, T]>[x, R.value], R.rlist))));

export const uncons = <T>(R: RList<T>): [T, RList<T>] => {
  if (R instanceof One && isEmpty(R.rlist))
    return [R.value, EmptyRList];
  if (R instanceof One)
    return [R.value, new Zero(R.rlist)];
  let [[first, second], third] = uncons(R.rlist);
  return [first, new One(second, third)];
};

export const lookup = <T>(i: number, R: RList<T>): T => {
  if (isEmpty(R))
    raise('EmptyRList');
  if (i === 0 && R instanceof One)
    return R.value;
  let [first, second] = lookup((i >> 1), R.rlist);
  if ((i & 1) === 0)
    return first;
  return second;
};

const fupdate = <T>(f: (_: T) => T, i: number, R: RList<T>): RList<T> => {
  if (isEmpty(R))
    raise('EmptyRList');
  if (i === 0 && R instanceof One)
    return new One(f(R.value), R.rlist);
  if (R instanceof One)
    return cons(
      R.value,
      fupdate(f, i - 1, new Zero(R.rlist)));
  let func = (t: [T, T]): [T, T] =>
    ((i & 1) === 0 ?
      [f(t[0]), t[1]]
    : [t[0], f(t[1])]);
  return new Zero(fupdate(func, (i >> 1), R.rlist));
};

export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
  fupdate((_: T) => y, i, R);
