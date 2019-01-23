/*

Pure functional implementation of
a binary tree that works for any comparable type.

Here an empty tree is represented by the null
object.

*/

import { Util } from '../util';

export namespace BinaryTree {
    export type Node<T> = (f: Selector<T>) => (T | Node<T>);

    type Selector<T> =
        (left: Node<T>, value: T, right: Node<T>) => (T | Node<T>);

    export const EmptyTree = <Node<any>>(null);

    export const isEmpty = <T>(t: Node<T>): boolean => (t === EmptyTree);

    const createTreeNode =
        <T>(left: Node<T>, val: T, right: Node<T>): Node<T> =>
            f => f(left, val, right);

    export const left = <S>(T: Node<S>) =>
        (<Node<S>>T((l: Node<S>, v: S, r: Node<S>) => l));

    export const nodeValue = <S>(T: Node<S>) =>
        (isEmpty(T) ? Util.raise('EmptyTree')
        : (<S>T((l: Node<S>, v: S, r: Node<S>) => v)));

    export const right = <S>(T: Node<S>): Node<S> =>
        (<Node<S>>T((l: Node<S>, v: S, r: Node<S>) => r));

    export const member = <S>(x: S, T: Node<S>): boolean =>
        (isEmpty(T) &&
            (x < nodeValue(T) ?
                member(x, left(T))
            : (x > nodeValue(T) ?
                member(x, right(T))
            : true)));

    export const insert = <S>(x: S, T: Node<S>): Node<S> =>
        (isEmpty(T) ?
            createTreeNode(EmptyTree, x, EmptyTree)
        : (x < nodeValue(T) ?
            createTreeNode(insert(x, left(T)), nodeValue(T), right(T))
        : (x > nodeValue(T) ?
            createTreeNode(left(T), nodeValue(T), insert(x, right(T)))
        : T)));

    // Solution for exercise 2.2
    export const member2 = <S>(x: S, T: Node<S>): boolean => {
        if (isEmpty(T)) return false;
        let helper = (y: S, Tr: Node<S>): boolean =>
            (isEmpty(Tr) ?
                (x === y)
            : (x <= nodeValue(Tr) ?
                helper(nodeValue(Tr), left(Tr))
            : helper(y, right(Tr))));
        return helper(nodeValue(T), T);
    }

    // Solution for exercise 2.3
    export const insert2 = <S>(x: S, T: Node<S>): Node<S> => {
        try {
            let helper = (Tr: Node<S>): Node<S> =>
                (isEmpty(Tr) ?
                    createTreeNode(EmptyTree, x, EmptyTree)
                : (x < nodeValue(Tr) ?
                    helper(left(Tr))
                : (x > nodeValue(Tr) ?
                    helper(right(Tr))
                : Util.raise('SameValue'))));
            return helper(T);
        } catch (err) {
            if (err.message !== 'SameValue') throw err;
            return T;
        }
    };

    // Solution to exercise 2.4
    export const insert3 = <S>(x: S, T: Node<S>): Node<S> => {
        try {
            let helper = (y: S, Tr: Node<S>): Node<S> =>
                (isEmpty(Tr) ?
                    (x === y ?
                        Util.raise('SameValue')
                    : createTreeNode(EmptyTree, x, EmptyTree))
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
    export const complete = <T>(value: T, height: number): Node<T> =>
        (height === 0 ?
            EmptyTree
        : createTreeNode(
            complete(value, height - 1),
            value,
            complete(value, height - 1)));

    // Solution to exercise 2.5b
    export const balanced = <T>(value: T, m: number): Node<T> =>
        (m === 0 ?
            EmptyTree
        : (m % 2 === 0 ?
            createTreeNode(
                balanced(value, (m  / 2)),
                value,
                balanced(value, (m / 2) - 1))
        : createTreeNode(
            balanced(value, (m - 1) / 2),
            value,
            balanced(value, (m - 1) / 2))));
}
