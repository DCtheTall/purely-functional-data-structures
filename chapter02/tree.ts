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
    (T === null ? raise('EmptyTree')
        : (<S>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => v)));

export const right = <S>(T: TreeNode<S>): TreeNode<S> =>
    (<TreeNode<S>>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => r));

export const member = <S>(x: S, T: TreeNode<S>): boolean =>
    (T !== null &&
        (x < value(T) ?
            member(x, left(T))
            : (x > value(T) ?
                member(x, right(T))
                : true)));

export const insert = <S>(x: S, T: TreeNode<S>): TreeNode<S> =>
    (T === null ? <TreeNode<S>>(f => f(null, x, null))
        : (x < value(T) ?
            createTreeNode(insert(x, left(T)), value(T), right(T))
            : (x > value(T) ?
                createTreeNode(left(T), value(T), insert(x, right(T)))
                : T)));

// Solution for exercise 2.2
export const member2 = <S>(x: S, T: TreeNode<S>): boolean => {
    if (T === null) return false;
    let helper = (y: S, Tr: TreeNode<S>) =>
        (Tr === null ?
            (x === y)
            : (x <= value(Tr) ?
                helper(value(Tr), left(Tr))
                : helper(y, right(Tr))));
    return helper(value(T), T);
}

// Solution for exercise 2.3
export const insert2 = <S>(x: S, T: TreeNode<S>): TreeNode<S> => {
    try {
        let helper = (Tr: TreeNode<S>): TreeNode<S> =>
            (Tr === null ?
                createTreeNode(null, x, null)
                : (x < value(Tr) ?
                    helper(left(Tr))
                    : (x > value(Tr) ?
                        helper(right(Tr))
                        : raise('SameValue'))));
        return helper(T);
    } catch (err) {
        if (err.message !== 'SameValue') throw err;
        return T;
    }
};

// Solution to exercise 2.5
export const complete = <S>(value: S, height: number): TreeNode<S> =>
    (height === 0 ? null
        : createTreeNode(
            complete(value, height - 1), value, complete(value, height - 1)));
