/*

Pure functional implementation of
a binary tree that works for any comparable type.

Here an empty tree is represented by the null
object.

*/

import { raise } from './list';

export type TreeNode<T> = (f: Selector<T>) => (T|TreeNode<T>);

export type Selector<T> =
    (left: TreeNode<T>, value: T, right: TreeNode<T>) => (T|TreeNode<T>);

export const createTreeNode =
    <T>(left: TreeNode<T>, val: T, right: TreeNode<T>): TreeNode<T> =>
        f => f(left, val, right);

export const left = <S>(T: TreeNode<S>) =>
    (<TreeNode<S>>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => l));

export const value = <S>(T: TreeNode<S>) =>
    (T === null ? raise('Empty tree')
        : (<S>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => v)));

export const right = <S>(T: TreeNode<S>): TreeNode<S> =>
    (<TreeNode<S>>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => r));

export const member = <S>(T: TreeNode<S>, x: S): boolean =>
    (T === null ? false
        : (x < value(T) ?
            member(left<S>(T), x)
            : (x > value(T) ?
                member(right<S>(T), x)
                : true)));

export const insert = <S>(T: TreeNode<S>, x: S): TreeNode<S> =>
    (T === null ? <TreeNode<S>>(f => f(null, x, null))
        : (x < value(T) ?
            createTreeNode(insert(left(T), x), value(T), right(T))
            : (x > value(T) ?
                createTreeNode(left(T), value(T), insert(right(T), x))
                : T)));
