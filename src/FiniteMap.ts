/*

Purely Functional Data Structures
=================================
Finite Map
----------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  BinaryTree,
  isEmpty as isEmptyTree,
  EmptyTree,
} from './BinaryTree';
import { raise, less, greater, equal, Comparable } from './util';

export class MapElem<S extends Comparable, T> {
  constructor(
    public readonly key: S,
    public readonly value: T,
  ) {
    Object.freeze(this);
  }

  public less(other: MapElem<S, T>) {
    return less(this.key, other.key);
  }

  public equals(other: MapElem<S, T>) {
    return equal(this.key, other.key);
  }
}

export type FiniteMap<S extends Comparable, T> = BinaryTree<MapElem<S, T>>;

export const EmptyMap = EmptyTree;

export const isEmpty = isEmptyTree;

export const lookup =
  <S extends Comparable, T>(M: FiniteMap<S, T>, k: S): T =>
    (isEmpty(M) ?
      raise('NotFound')
    : (less(k, M.value.key) ?
      lookup(M.left, k)
    : (greater(k, M.value.key) ?
      lookup(M.right, k)
    : M.value.value)));

export const bind =
  <S extends Comparable, T>(k: S, val: T, M: FiniteMap<S, T>): FiniteMap<S, T> =>
    (isEmpty(M) ?
      new BinaryTree(new MapElem(k, val), EmptyMap, EmptyMap)
    : (less(k, M.value.key) ?
      new BinaryTree(
        M.value,
        bind(k, val, M.left),
        M.right)
    : (greater(k, M.value.key) ?
      new BinaryTree(
        M.value,
        M.left,
        bind(k, val, M.right))
    : new BinaryTree(
      new MapElem(k, val),
      EmptyMap,
      EmptyMap))));
