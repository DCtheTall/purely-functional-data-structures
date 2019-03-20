/*

Purely Functional Data Structures
=================================
Stream
------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { Suspension, $, greater } from './util';
import { List, EmptyList, isEmpty as isEmptyList, cons as consList } from './List';

class StreamCell<T> {
  constructor(
    public readonly head: T,
    public readonly tail: Stream<T>,
  ) {
    Object.freeze(this);
  }
}

export type Stream<T> = Suspension<StreamCell<T>>;

const EmptyCell = <StreamCell<any>>null;

export const EmptyStream = new Suspension(() => EmptyCell);

export const isEmpty = (S: Stream<any>) => (S.force() === EmptyCell);

export const cons = <T>(x: T, S: Stream<T>): Stream<T> =>
  $(() => new StreamCell(x, S));

export const concat = <T>(A: Stream<T>, B: Stream<T>): Stream<T> =>
  $(() =>
    (isEmpty(A) ? B
    : cons(A.force().head, concat(A.force().tail, B))).force());

export const take = <T>(n: number, S: Stream<T>): Stream<T> =>
  $(() =>
    (n === 0 ?
      EmptyStream
    : cons(S.force().head, take(n - 1, S))).force());

export const drop = <T>(n: number, S: Stream<T>): Stream<T> =>
  $(() =>
    (n === 0 ? S
    : drop(n - 1, S)).force());

export const sort = <T>(k: number, S: Stream<T>): Stream<T> =>
  $(() => {
    let findMinAboveLowerBound = (S: Stream<T>, lb: T, cur: T) =>
      (S === EmptyStream ? cur
      : (cur === null ?
        findMinAboveLowerBound(S.force().tail, lb, S.force().head)
      : (greater(cur, S.force().head) &&
        ((lb === null) || greater(S.force().head, lb)) ?
          findMinAboveLowerBound(S.force().tail, lb, S.force().head)
      : findMinAboveLowerBound(S.force().tail, lb, cur))));

    let sortHelper = (k: number, s: Stream<T>, lb: T): Stream<T> => {
      let min = findMinAboveLowerBound(s, lb, null);
      let helper = (k: number, s: Stream<T>) =>
        (k === 0 ? EmptyStream
        : (s === EmptyStream ? EmptyStream
        : cons(min, sortHelper(k - 1, s, min))));
      return <Stream<T>>helper(k, s);
    };
    return sortHelper(k, S, null).force();
  });

export const reverse = <T>(S: Stream<T>): Stream<T> =>
  $(() => {
    let reverseHelper = (L: Stream<T>, R: Stream<T>): Stream<T> =>
      (isEmpty(R) ? L
      : reverseHelper(cons(R.force().head, L), R.force().tail));
    return reverseHelper(EmptyStream, S).force();
  });

export const length = (S: Stream<any>): number =>
  (isEmpty(S) ? 0
  : 1 + length(S.force().tail));

export const listToStream = <T>(L: List<T>): Stream<T> =>
  (isEmptyList(L) ?
    EmptyStream
  : cons(
    L.head,
    listToStream(L.tail)));

export const streamToList = <T>(S: Stream<T>): List<T> =>
  (isEmpty(S) ?
      EmptyList
  : consList(
    S.force().head,
    streamToList(S.force().tail)));