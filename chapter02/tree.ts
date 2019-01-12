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

export const nodeValue = <S>(T: TreeNode<S>) =>
    (T === null ? raise('EmptyTree')
        : (<S>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => v)));

export const right = <S>(T: TreeNode<S>): TreeNode<S> =>
    (<TreeNode<S>>T((l: TreeNode<S>, v: S, r: TreeNode<S>) => r));

export const member = <S>(x: S, T: TreeNode<S>): boolean =>
    (T !== null &&
        (x < nodeValue(T) ?
            member(x, left(T))
            : (x > nodeValue(T) ?
                member(x, right(T))
                : true)));

export const insert = <S>(x: S, T: TreeNode<S>): TreeNode<S> =>
    (T === null ? <TreeNode<S>>(f => f(null, x, null))
        : (x < nodeValue(T) ?
            createTreeNode(insert(x, left(T)), nodeValue(T), right(T))
            : (x > nodeValue(T) ?
                createTreeNode(left(T), nodeValue(T), insert(x, right(T)))
                : T)));

// Solution for exercise 2.2
export const member2 = <S>(x: S, T: TreeNode<S>): boolean => {
    if (T === null) return false;
    let helper = (y: S, Tr: TreeNode<S>): boolean =>
        (Tr === null ?
            (x === y)
            : (x <= nodeValue(Tr) ?
                helper(nodeValue(Tr), left(Tr))
                : helper(y, right(Tr))));
    return helper(nodeValue(T), T);
}

// Solution for exercise 2.3
export const insert2 = <S>(x: S, T: TreeNode<S>): TreeNode<S> => {
    try {
        let helper = (Tr: TreeNode<S>): TreeNode<S> =>
            (Tr === null ?
                createTreeNode(null, x, null)
                : (x < nodeValue(Tr) ?
                    helper(left(Tr))
                    : (x > nodeValue(Tr) ?
                        helper(right(Tr))
                        : raise('SameValue'))));
        return helper(T);
    } catch (err) {
        if (err.message !== 'SameValue') throw err;
        return T;
    }
};

// Solution to exercise 2.4
export const insert3 = <S>(x: S, T: TreeNode<S>): TreeNode<S> => {
    try {
        let helper = (y: S, Tr: TreeNode<S>): TreeNode<S> =>
            (Tr === null ?
                (x === y ?
                    raise('SameValue')
                    : createTreeNode(null, x, null))
                : (x <= nodeValue(Tr) ?
                    helper(nodeValue(Tr), left(Tr))
                    : helper(y, right(Tr))));
        return helper(nodeValue(T), T);
    } catch (err) {
        if (err.message !== 'SameValue') throw err;
        return T;
    }
}

// Solution to exercise 2.5a
export const complete = <S>(value: S, height: number): TreeNode<S> =>
    (height === 0 ? null
        : createTreeNode(
            complete(value, height - 1),
            value,
            complete(value, height - 1)));
