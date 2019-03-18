/*

Purely Functional Data Structures
=================================
Finite Map
----------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import { recursive, call } from 'tallstack';
import {
  BinaryTree,
  isEmpty as isEmptyTree,
  EmptyTree,
} from './BinaryTree';
import { raise, less, greater } from './util';

export class MapElem<S, T> {
  constructor(
    public readonly key: S,
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

export type Map<S, T> = BinaryTree<MapElem<S, T>>;

export const EmptyMap = EmptyTree;

export const isEmpty = isEmptyTree;

export const lookup = recursive(
  <S, T>(M: Map<S, T>, k: S): T =>
    (isEmpty(M) ?
      raise('NotFound')
    : (less(k, M.value.key) ?
      <T>call(lookup, M.left, k)
    : (greater(k, M.value.key) ?
      <T>call(lookup, M.right, k)
    : M.value.value))));

export const bind = recursive(
  <S, T>(k: S, val: Text, M: Map<S, T>): Map<S, T> =>
    (isEmpty(M) ?
      new BinaryTree(new MapElem(k, val), EmptyMap, EmptyMap)
    : (less(k, M.value.key) ?
      call(
        BinaryTree.create,
        M.value,
        call(bind, k, val, M.left),
        M.right)
    : (greater(k, M.value.key) ?
      call(
        BinaryTree.create,
        M.value,
        M.left,
        call(bind, k, val, M.right))
    : new BinaryTree(
      new MapElem(k, val),
      EmptyMap,
      EmptyMap)))));
