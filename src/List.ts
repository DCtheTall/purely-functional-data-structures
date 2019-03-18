/*

Purely Functional Data Structures
=================================
List
----

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { recursive, call } from 'tallstack';
import { raise } from './util';

export class List<T> {
  constructor(
    public readonly head: T,
    public readonly tail: List<T>,
  ) {
    Object.freeze(this);
  }
}

export const EmptyList = <List<any>>null;

export const isEmpty = (L: List<any>) => (L === EmptyList);

export const cons = <T>(x: T, L: List<T>) => new List(x, L);

export const reverse = <T>(L: List<T>): List<T> => {
   let helper = recursive((L: List<T>, R: List<T>): List<T> =>
    (isEmpty(R) ? L
    : call(helper, cons(R.head, L), R.tail)));
  return helper(EmptyList, L);
};

export const concat = <T>(A: List<T>, B: List<T>): List<T> => {
  let helper = recursive((A: List<T>, B: List<T>): List<T> =>
    (isEmpty(A) ? B
    : call(helper, A.tail, cons(A.head, B))));
  return helper(reverse(A), B);
};

export const update = recursive(
  <T>(L: List<T>, i: number, y: T): List<T> =>
    (isEmpty(L) ?
      raise('IndexError')
    : (i === 0 ?
        cons(y, L.tail)
    : call(cons, L.head, call(update, L.tail, i - 1, y)))));

export const suffixes = recursive(
  <T>(L: List<T>): List<List<T>> =>
    (isEmpty(L) ? cons(EmptyList, EmptyList)
    : call(cons, L, call(suffixes, L.tail))));

export const length = <T>(L: List<T>): number => {
  let helper = recursive((L: List<T>, n: number): number =>
    (isEmpty(L) ? n
    : call(helper, L.tail, n + 1)));
  return helper(L, 0);
};

export const slice = recursive(
  <T>(L: List<T>, lb: number, ub: number): List<T> =>
    (isEmpty(L) ?
      EmptyList
    : (lb > 0 ?
      call(slice, L.tail, lb - 1, ub - 1)
    : (ub > 0 ?
      call(cons, L.head, call(slice, L.tail, 0, ub - 1))
    : EmptyList))));

type ReduceCallback<S, T> = (acc: S, el: T) => S;

export const reduce = recursive(
  <S, T>(L: List<T>, callback: ReduceCallback<S, T>, initial: S): S =>
    (isEmpty(L) ? initial
    : call(reduce, L.tail, callback, callback(initial, L.head))));

export const map = recursive(
  <S, T>(L: List<T>, callback: (el: T) => S): List<S> =>
    (isEmpty(L) ? EmptyList
    : call(cons, callback(L.head), call(map, L.tail, callback))));
