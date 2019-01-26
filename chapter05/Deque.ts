/*

Double-ended queue (Deque)
Solution to exercise 5.1

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace Deque {
    export type Deque<T> = (f: Selector<T>) => List.List<T>;

    type Selector<T> = (L: List.List<T>, R: List.List<T>) => List.List<T>;

    const left = <T>(Q: Deque<T>) => Q((L, R) => L);

    const right = <T>(Q: Deque<T>) => Q((L, R) => R);

    export const EmptyDeque = <Deque<any>>(D => D(List.EmptyList, List.EmptyList));

    export const isEmpty = <T>(D: Deque<T>) =>
        (List.isEmpty(left(D)) && List.isEmpty(right(D)));

    const createDeque = <T>(L: List.List<T>, R: List.List<T>) =>
        <Deque<T>>(D => D(L, R));

    const checkLeft = <T>(D: Deque<T>): Deque<T> => {
        if (!List.isEmpty(left(D)) || List.length(right(D)) < 2) return D;
        let len = List.length(right(D));
        return createDeque(
            List.reverse(List.slice(right(D), Math.floor(len / 2), len)),
            List.slice(right(D), 0, Math.floor(len / 2)));
    };

    const checkRight = <T>(D: Deque<T>): Deque<T> => {
        if (!List.isEmpty(right(D)) || List.length(left(D)) < 2) return D;
        let len = List.length(left(D));
        return createDeque(
            List.slice(left(D), 0, Math.floor(len / 2)),
            List.reverse(List.slice(left(D), Math.floor(len / 2), len)));
    };

    export const consLeft = <T>(e: T, D: Deque<T>): Deque<T> =>
        checkRight(createDeque(List.cons(e, left(D)), right(D)));

    export const consRight = <T>(e: T, D: Deque<T>): Deque<T> =>
        checkLeft(createDeque(left(D), List.cons(e, right(D))));

    export const leftHead = <T>(D: Deque<T>): T =>
        (isEmpty(D) ? Util.raise('EmptyDeque')
        : (List.isEmpty(left(D)) ? List.head(right(D))
        : List.head(left(D))));

    export const rightHead = <T>(D: Deque<T>): T =>
        (isEmpty(D) ? Util.raise('EmptyDeque')
        : (List.isEmpty(right(D)) ? List.head(left(D))
        : List.head(right(D))));

    export const leftTail = <T>(D: Deque<T>): Deque<T> =>
        (isEmpty(D) ? Util.raise('EmptyDeque')
        : (List.isEmpty(left(D)) ? EmptyDeque
        : createDeque(List.tail(left(D)), right(D))));

    export const rightTail = <T>(D: Deque<T>): Deque<T> =>
        (isEmpty(D) ? Util.raise('EmptyDeque')
        : (List.isEmpty(right(D)) ? EmptyDeque
        : createDeque(left(D), List.tail(right(D)))));
}
