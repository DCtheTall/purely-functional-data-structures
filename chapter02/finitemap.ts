/*

Unordered set and unordered map functional data structures.

These structures use the binary tree (tree.ts) to implement
an unordered set and map.

This program is a solution to exercise 2.6

*/

import { BinaryTree } from './BinaryTree';
import { Util } from '../util';

export namespace FiniteMap {
    export type KeyValuePair<S, T> = (f: KvpSelector<S, T>) => (S | T);

    export type KvpSelector<S, T> = (key: S, value: T) => (S | T);

    export type FiniteMap<S, T> = BinaryTree.Node<KeyValuePair<S, T>>;

    export const createMapElem =
        <S, T>(left: FiniteMap<S, T>, val: KeyValuePair<S, T>, right: FiniteMap<S, T>): FiniteMap<S, T> =>
            f => f(left, val, right);

    export const createKvp = <S, T>(k: S, val: T): KeyValuePair<S, T> => (f => f(k, val));

    export const key = <S, T>(kvp: KeyValuePair<S, T>): S => <S>kvp((x: S, y: T): S => x);

    export const valueof = <S, T>(kvp: KeyValuePair<S, T>): T => <T>kvp((x: S, y: T): T => y);

    export const get = <S, T>(M: FiniteMap<S, T>, k: S): T =>
        (BinaryTree.isEmpty(M) ? Util.raise('NotFound')
            : (key(BinaryTree.nodeValue(M)) < k ? get(BinaryTree.left(M), k)
            : (key(BinaryTree.nodeValue(M)) > k ? get(BinaryTree.right(M), k)
            : valueof(BinaryTree.nodeValue(M)))));

    export const set = <S, T>(M: FiniteMap<S, T>, k: S, val: T): FiniteMap<S, T> =>
        (BinaryTree.isEmpty(M) ?
            <FiniteMap<S, T>>(f => f(BinaryTree.EmptyTree, createKvp(k, val), BinaryTree.EmptyTree))
        : (k < key(BinaryTree.nodeValue(M)) ?
            createMapElem(
                set(BinaryTree.left(M), k, val),
                BinaryTree.nodeValue(M),
                BinaryTree.right(M))
        : (k > key(BinaryTree.nodeValue(M)) ?
            createMapElem(
                BinaryTree.left(M),
                BinaryTree.nodeValue(M),
                set(BinaryTree.right(M), k, val))
        : createMapElem(
            BinaryTree.left(M),
            createKvp(k, val),
            BinaryTree.right(M)))));
}
