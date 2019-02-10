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

    // Reverse a list in O(n) time
    // tail call optimized
    export const reverse = <T>(A: List<T>) => {
        let helper = (L: List<T>, R: List<T>): List<T> =>
            (isEmpty(R) ? L
                : Util.recurseOn(
                    () => helper(cons(head(R), L), tail(R))));
        return Util.trampoline(helper)(EmptyList, A);
    };

    // Head of A becomes head of new list
    export function concat<T>(A: List<T>, B: List<T>): List<T> {
        const helper = (A: List<T>, B: List<T>): List<T> =>
            (isEmpty(A) ? B
            : Util.recurseOn(() =>
                helper(tail(A), cons(List.head(A), B))));
        return Util.trampoline(helper)(reverse(A), B);
    };

    export const update = <T>(L: List<T>, i: number, y: T): List<T> =>
        (isEmpty(L) ?
            Util.raise('Index error')
            : (i === 0 ?
                cons(y, tail<T>(L))
            : cons(head(L), update(tail(L), i - 1, y))));

    // Solution for exercise 2.1
    export const suffixes = <T>(L: List<T>): List<List<T>> =>
        (isEmpty(L) ?
            cons(EmptyList, EmptyList)
        : cons(L, suffixes(tail(L))));

    // Tail call optimized length function
    export const length = <T>(L: List<T>): number => {
        const helper = (L: List<T>, n: number) =>
            (isEmpty(L) ? n
            : Util.recurseOn(() => helper(tail(L), n + 1)));
        return Util.trampoline(helper)(L, 0);
    };

    // Slice from index "lb" (head is 0, recall this is LIFO) up to but not including
    // index "ub"
    export const slice = <T>(L: List<T>, lb: number, ub: number) =>
        (isEmpty(L) ?
            EmptyList
        : (lb > 0 ?
            slice(tail(L), lb - 1, ub - 1)
        : (ub > 0 ?
            cons(head(L), slice(tail(L), 0, ub - 1))
        : EmptyList)));

    type ReduceCallback<S, T> = (acc: S, el: T) => S;

    export const reduce =
        <S, T>(L: List.List<T>, callback: ReduceCallback<S, T>, initial: S): S =>
            (List.isEmpty(L) ?
                initial
            : reduce(
                List.tail(L),
                callback,
                callback(initial, List.head(L))));
}
