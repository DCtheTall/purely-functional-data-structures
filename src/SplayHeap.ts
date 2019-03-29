/*

Purely Functional Data Structures
=================================
Splay Heap
----------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
    BinaryTree,
    EmptyTree,
    isEmpty as isEmptyTree,
} from './BinaryTree';
import { leq, geq, raise, Comparable } from './util';

export class Heap<T extends Comparable> extends BinaryTree<T> {
  public readonly left: Heap<T>;
  public readonly right: Heap<T>;
}

export const EmptyHeap = <Heap<any>>EmptyTree;

export const isEmpty = isEmptyTree;

const bigger = <T extends Comparable>(pivot: T, H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    EmptyHeap
  : (leq(pivot, H.value) ?
    bigger(pivot, H.right)
  : (isEmpty(H.left) ?
    H
  : (leq(H.left.value, pivot) ?
    new Heap(
      H.value,
      bigger(pivot, H.left.right),
      H.right)
  : new Heap(
    H.left.value,
    bigger(pivot, H.left.left),
    new Heap(
      H.value,
      bigger(pivot, H.left.right),
      H.right))))));

export const smaller = <T extends Comparable>(pivot: T, H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    EmptyHeap
  : (geq(pivot, H.value) ?
    smaller(pivot, H.left)
  : (geq(H.right.value, pivot) ?
    new Heap(
      H.value,
      H.left,
      smaller(pivot, H.right.left))
  : new Heap(
    H.right.value,
    new Heap(
      H.value,
      H.left,
      smaller(pivot, H.right.left)),
    smaller(pivot, H.right.right)))));

export const partition = <T extends Comparable>(pivot: T, H: Heap<T>): [Heap<T>, Heap<T>] => {
  if (isEmpty(H))
    return [EmptyHeap, EmptyHeap];
  if (leq(H.value, pivot)) {
    if (isEmpty(H.right))
      return [H, EmptyHeap];
    if (leq(H.right.value, pivot)) {
      let [first, second] = partition(pivot, H.right.right);
      return [
        new Heap(
          H.right.value,
          new Heap(
            H.value,
            H.left,
            H.right.left),
          first),
        second];
    }
    let [first, second] = partition(pivot, H.right.left);
    return [
      new Heap(
        H.value,
        H.left,
        first),
      new Heap(
        H.right.value,
        second,
        H.right.right)];
  }
  if (isEmpty(H.left))
    return [EmptyHeap, H];
  if (leq(H.left.value, pivot)) {
    let [first, second] = partition(pivot, H.left.right);
    return [
      new Heap(
        H.left.value,
        H.left.left,
        first),
      new Heap(
        H.value,
        second,
        H.right)];
  }
  let [first, second] = partition(pivot, H.left.left);
  return [
    first,
    new Heap(
      H.left.value,
      second,
      new Heap(
        H.value,
        H.left.right,
        H.right))];
}

export const findMin = <T extends Comparable>(H: Heap<T>): T =>
  (isEmpty(H.left) ?
      H.value
  : H.left.value);

export const insert = <T extends Comparable>(x: T, H: Heap<T>): Heap<T> => {
  let [first, second] = partition(x, H);
  return new Heap(x, first, second);
}

export const merge = <T extends Comparable>(A: Heap<T>, B: Heap<T>): Heap<T> => {
  if (isEmpty(A)) return B;
  let [first, second] = partition(A.value, B);
  return new Heap(
    A.value,
    merge(first, A.left),
    merge(second, A.right));
}

export const deleteMin = <T extends Comparable>(H: Heap<T>): Heap<T> =>
  (isEmpty(H) ?
    raise('EmptyHeap')
  : (isEmpty(H.left) ?
    EmptyHeap
  : (isEmpty(H.left.left) ?
    new Heap(H.value,
      H.left.right,
      H.right)
  : new Heap(
    H.left.value,
    deleteMin(H.left.left),
    new Heap(
      H.value,
      H.left.right,
      H.right)))));
