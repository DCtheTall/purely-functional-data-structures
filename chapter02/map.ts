/*

Unordered set and unordered map functional data structures.

These structures use the binary tree (tree.ts) to implement
an unordered set and map.

*/

import { raise } from './list';
import { TreeNode, left, right, value } from './tree';

export type KeyValuePair<S, T> = (f: Selector<S, T>) => (S|T);

export type Selector<S, T> = (key: S, value: T) => (S|T);

export type FiniteMap<S, T> = TreeNode<KeyValuePair<S, T>>;

export const createMapElem =
    <S, T>(left: FiniteMap<S, T>, val: KeyValuePair<S, T>, right: FiniteMap<S, T>): FiniteMap<S, T> =>
        f => f(left, val, right);

export const createKvp = <S, T>(k: S, val: T): KeyValuePair<S, T> => (f => f(k, val));

export const key = <S, T>(kvp: KeyValuePair<S, T>): S => <S>kvp((x: S, y: T): S => x);

export const valueof = <S, T>(kvp: KeyValuePair<S, T>): T => <T>kvp((x: S, y: T): T => y);

export const get = <S, T>(M: FiniteMap<S, T>, k: S): T =>
    (M === null ? raise('Not found.')
        : (key(value(M)) < k ? get(left(M), k)
            : (key(value(M)) > k ? get(right(M), k)
                : valueof(value(M)))));

export const set = <S, T>(M: FiniteMap<S, T>, k: S, val: T): FiniteMap<S, T> =>
    (M === null ? <FiniteMap<S, T>>(f => f(null, createKvp(k, val), null))
        : (k < key(value(M)) ?
            createMapElem(set(left(M), k, val), value(M), right(M))
            : (k > key(value(M)) ?
                createMapElem(left(M), value(M), set(right(M), k, val))
                : createMapElem(left(M), createKvp(k, val), right(M)))));