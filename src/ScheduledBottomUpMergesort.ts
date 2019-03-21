/*

Purely Functional Data Structures
=================================
Scheduled Bottom Up Mergesort
-----------------------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  isEmpty as isEmptyList,
  EmptyList,
  cons as consList,
  reverse,
  map,
} from './List';
import {
  Stream,
  isEmpty as isEmptyStream,
  cons as consStream,
  EmptyStream,
  streamToList,
 } from './Stream';
import { leq, $ } from './util';

type Schedule<T> = List<Stream<T>>;

const exec1 = <T>(schedule: Schedule<T>): Schedule<T> =>
  (isEmptyList(schedule) ?
    EmptyList
  : (isEmptyStream(schedule.head) ?
    exec1(schedule.tail)
  : consList(
    schedule.head.force().tail,
    schedule.tail)));

class Segment<T> {
  constructor(
    public readonly stream: Stream<T>,
    public readonly schedule: Schedule<T>,
  ) {
    Object.freeze(this);
  }
}

const exec2 = <T>(seg: Segment<T>): Segment<T> =>
  new Segment(seg.stream, exec1(exec1(seg.schedule)));

export class Sortable<T> {
  constructor(
    public readonly size: number,
    public readonly segments: List<Segment<T>>,
  ) {
    Object.freeze(this);
  }
}

export const EmptySortable = new Sortable(0, EmptyList);

export const isEmpty = (S: Sortable<any>) => (S.size === 0);

const mrg = <T>(A: Stream<T>, B: Stream<T>): Stream<T> =>
  (isEmptyStream(A) ? B
  : (isEmptyStream(B) ? A
  : (leq(A.force().head, B.force().head) ?
    consStream(A.force().head, mrg(A.force().tail, B))
  : consStream(B.force().head, mrg(A, B.force().tail)))));

const addSeg =
  <T>(xs: Stream<T>, segs: List<Segment<T>>, size: number,
    rearsched: Schedule<T>): List<Segment<T>> => {
      if ((size & 1) === 0)
        return consList(
          new Segment(xs, reverse(rearsched)),
          segs);
      let val = mrg(xs, segs.head.stream);
      return addSeg(
        val,
        segs.tail,
        Math.floor(size / 2),
        consList(val, rearsched));
    };

const mrgAll = <T>(S: Stream<T>, L: List<Segment<T>>): Stream<T> =>
  $(() =>
    (isEmptyList(L) ? S
    : mrgAll(mrg(S, L.head.stream), L.tail)).force());

export const add = <T>(x: T, S: Sortable<T>): Sortable<T> =>
  new Sortable(
    S.size + 1,
    map(
      addSeg(
        consStream(x, EmptyStream),
        S.segments,
        S.size,
        EmptyList),
      exec2));

export const sort = <T>(S: Sortable<T>): List<T> =>
  streamToList(mrgAll(EmptyStream, S.segments));
