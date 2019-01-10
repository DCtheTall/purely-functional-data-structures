/*

Purely functional list data type for a generic type.

Here an empty list is represented by the null object.

*/

export const raise = (e: string) => { throw new Error(e) };

export type List<T> = (f: Selector<T>) => (T|List<T>);

export type Selector<T> = (e: T, L: List<T>) => (T|List<T>);

export const head = <T>(L: List<T>): T => <T>(L((x, L) => x));

export const tail = <T>(L: List<T>): List<T> => <List<T>>(L((x, L) => L));

export const cons = <T>(e: T, L: List<T>): List<T> => f => f(e, L);

export const concat = <T>(A: List<T>, B: List<T>): List<T> =>
    (A === null ? B : cons(head(A), concat(tail(A), B)));

export const update = <T>(L: List<T>, i: number, y: T): List<T> =>
    (L === null ?
        raise('Index error')
        : (i === 0 ?
            cons(y, tail<T>(L))
            : cons(head(L), update(tail(L), i - 1, y))));

// Solution for exercise 2.1
export const suffixes = <T>(L: List<T>) =>
    (L === null ?
        cons(null, null)
        : cons(L, suffixes(tail(L))));
