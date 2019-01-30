/*

Purely functional list data type for a generic type.

Here an empty list is represented by the null object.

*/

import { Util } from '../util';

export namespace List {
    export type List<T> = (f: Selector<T>) => (T | List<T>);

    type Selector<T> = (e: T, L: List<T>) => (T | List<T>);

    export const EmptyList = <List<any>>(null);

    export const isEmpty = <T>(L: List<T>): boolean => (L === EmptyList);

    // Future refactor: wrap selectors in a functor that checks if
    // the structure is empty before reading it
    export const head = <T>(L: List<T>): T =>
        <T>(isEmpty(L) ? Util.raise('EmptyList') : L((x, L) => x));

    export const tail = <T>(L: List<T>): List<T> => <List<T>>(L((x, L) => L));

    export const cons = <T>(e: T, L: List<T>): List<T> => f => f(e, L);

    // Head of A becomes head of new list
    export function concat<T>(A: List<T>, B: List<T>): List<T> {
        let helper = Util.optimize<List<T>>(
            (A: List<T>, B: List<T>) =>
                (isEmpty(A) ? B
                : Util.optRecurse(
                    () => cons(head(A), concat(tail(A), B)))));
        return helper(A, B);
    }

    export const update = <T>(L: List<T>, i: number, y: T): List<T> =>
        (isEmpty(L) ?
            Util.raise('Index error')
            : (i === 0 ?
                cons(y, tail<T>(L))
            : cons(head(L), update(tail(L), i - 1, y))));

    // Solution for exercise 2.1
    export function suffixes<T>(L: List<T>): List<List<T>> {
        let helper = Util.optimize<List<List<T>>>(
            (L: List<T>) =>
                (isEmpty(L) ?
                    cons(EmptyList, EmptyList)
                : Util.optRecurse(() => cons(L, suffixes(tail(L))))));
        return helper(L);
    }

    // Tail call optimized length function
    export const length = <T>(L: List<T>): number => {
        let helper = Util.optimize<number>((L: List<T>) =>
            (isEmpty(L) ? 0
            : Util.optRecurse<number>(() => 1 + length(tail(L)))));
        return <number>helper(L);
    };

    // Slice from index "lb" (head is 0, recall this is LIFO) up to but not including
    // index "ub"
    export const slice = <T>(L: List<T>, lb: number, ub: number): List<T> => {
        let helper = Util.optimize<List.List<T>>((L: List<T>, lb: number, ub: number) =>
            (isEmpty(L) ? EmptyList
            : (lb > 0 ?
                Util.optRecurse(
                    () => slice(tail(L), lb - 1, ub - 1))
            : (ub > 0 ?
                Util.optRecurse(
                    () => cons(head(L), slice(tail(L), 0, ub - 1)))
            : EmptyList))));
        return helper(L, lb, ub);
    };

    // Reverse a list in O(n) time
    // tail call optimized
    export const reverse = <T>(A: List<T>) => {
        let reverseHelper = (L: List<T>, R: List<T>) => {
            let helper = Util.optimize<List<T>>((L: List<T>, R: List<T>): List<T> =>
                (isEmpty(R) ? L
                : Util.optRecurse(
                    () => reverseHelper(cons(head(R), L), tail(R)))));
            return helper(L, R);
        };
        return reverseHelper(EmptyList, A);
    };

    type ReduceCallback<S, T> = (acc: S, el: T) => S;

    export const reduce =
        <S, T>(L: List.List<T>, callback: ReduceCallback<S, T>, initial: S): S => {
            let helper = Util.optimize<S>(
                (L: List.List<T>, callback: ReduceCallback<S, T>, initial: S) =>
                    (List.isEmpty(L) ?
                        initial
                    : Util.optRecurse(() =>
                        reduce(
                            List.tail(L),
                            callback,
                            callback(initial, List.head(L))))));
            return <S>helper(L, callback, initial);
        };
}
