/*

Purely functional list data type for a generic type.

Here an empty list is represented by the null object.

*/

import { Util } from '../util';

export namespace List {
    export type List<T> = (f: Selector<T>) => (T | List<T>);

    export type Selector<T> = (e: T, L: List<T>) => (T | List<T>);

    export const EmptyList = <List<any>>(null);

    export const isEmpty = <T>(L: List<T>): boolean => (L === EmptyList);

    export const head = <T>(L: List<T>): T => <T>(L((x, L) => x));

    export const tail = <T>(L: List<T>): List<T> => <List<T>>(L((x, L) => L));

    export const cons = <T>(e: T, L: List<T>): List<T> => f => f(e, L);

    export function concat<T>(A: List<T>, B: List<T>): List<T> {
        let helper = Util.tailOpt(
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
        let helper = Util.tailOpt(
            (L: List<T>) =>
                (isEmpty(L) ?
                    cons(EmptyList, EmptyList)
                : Util.optRecurse(() => cons(L, suffixes(tail(L))))));
        return helper(L);
    }

    export const length = <T>(L: List<T>): number =>
        (isEmpty(L) ? 0 : 1 + length(tail(L)));

    // Slice from index "lb" (head is 0, recall this is LIFO) up to but not including
    // index "ub"
    export const slice = <T>(L: List<T>, lb: number, ub: number): List<T> =>
        (isEmpty(L) ? EmptyList
        : (lb > 0 ?
            slice(tail(L), lb - 1, ub - 1)
        : (ub > 0 ?
            cons(head(L), slice(tail(L), 0, ub - 1))
        : EmptyList)));
}
