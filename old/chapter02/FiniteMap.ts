/*

Unordered set and unordered map functional data structures.

These structures use the binary tree (tree.ts) to implement
an unordered set and map.

This program is a solution to exercise 2.6

*/

import { BinaryTree } from './BinaryTree';
import { Util } from '../util';

export namespace FiniteMap {
    type KeyValuePair<S, T> = (f: Selector<S, T>) => (S | T);

    type Selector<S, T> = (key: S, value: T) => (S | T);

    export type Map<S, T> = BinaryTree.Node<KeyValuePair<S, T>>;

    export const EmptyMap = BinaryTree.EmptyTree;

    export const isEmpty = BinaryTree.isEmpty;

    const createMapElem =
        <S, T>(left: Map<S, T>, val: KeyValuePair<S, T>, right: Map<S, T>): Map<S, T> =>
            f => f(left, val, right);

    const createKvp = <S, T>(k: S, val: T): KeyValuePair<S, T> => (f => f(k, val));

    const key = <S, T>(kvp: KeyValuePair<S, T>): S => <S>kvp((x: S, y: T): S => x);

    const valueof = <S, T>(kvp: KeyValuePair<S, T>): T => <T>kvp((x: S, y: T): T => y);

    export const lookup = <S, T>(M: Map<S, T>, k: S): T =>
        (BinaryTree.isEmpty(M) ? Util.raise('NotFound')
        : (key(BinaryTree.valueof(M)) < k ? lookup(BinaryTree.left(M), k)
        : (key(BinaryTree.valueof(M)) > k ? lookup(BinaryTree.right(M), k)
        : valueof(BinaryTree.valueof(M)))));

    export const bind = <S, T>(k: S, val: T, M: Map<S, T>): Map<S, T> =>
        (BinaryTree.isEmpty(M) ?
            <Map<S, T>>(f => f(BinaryTree.EmptyTree, createKvp(k, val), BinaryTree.EmptyTree))
        : (k < key(BinaryTree.valueof(M)) ?
            createMapElem(
                bind(k, val, BinaryTree.left(M)),
                BinaryTree.valueof(M),
                BinaryTree.right(M))
        : (k > key(BinaryTree.valueof(M)) ?
            createMapElem(
                BinaryTree.left(M),
                BinaryTree.valueof(M),
                bind(k, val, BinaryTree.right(M)))
        : createMapElem(
            BinaryTree.left(M),
            createKvp(k, val),
            BinaryTree.right(M)))));
}
