/*

Functional leftist heap datastructure

*/

import { List } from '../chapter02/List';


export namespace LeftistHeap {
    export type Heap<T> = (f: Selector<T>) => (number | T | Heap<T>);

    export type Selector<T> =
        (rank: number, value: T, left: Heap<T>, right: Heap<T>) => (number | T | Heap<T>);

    export const EmptyHeap = <Heap<any>>(null);

    export const isEmpty = <T>(H: Heap<T>): boolean => (H === EmptyHeap);

    export const rank = <T>(h: Heap<T>) =>
        <number>(isEmpty(h) ? 0 : h((r, v, lh, rh) => r));

    export const findMin = <T>(h: Heap<T>) => <T>h((r, v, lh, rh) => v);

    export const left = <T>(h: Heap<T>) => <Heap<T>>h((r, v, lh, rh) => lh);

    export const right = <T>(h: Heap<T>) => <Heap<T>>h((r, v, lh, rh) => rh);

    // makeHeap preserves the leftist property of the heap
    export const makeHeap = <T>(x: T, lh: Heap<T>, rh: Heap<T>): Heap<T> =>
        (rank(lh) >= rank(rh) ?
            <Heap<T>>(h => h(rank(rh) + 1, x, lh, rh))
        : <Heap<T>>(h => h(rank(lh) + 1, x, rh, lh)));

    export const merge = <T>(a: Heap<T>, b: Heap<T>): Heap<T> =>
        (isEmpty(a) ? b
        : (isEmpty(b) ? a
        : (findMin(a) <= findMin(b) ?
            makeHeap(findMin(a), left(a), merge(right(a), b))
        : makeHeap(findMin(b), left(b), merge(a, right(b))))));

    export const insert = <T>(x: T, h: Heap<T>): Heap<T> =>
        merge(<Heap<T>>(f => f(1, x, EmptyHeap, EmptyHeap)), h);

    // Solution to exercise 3.2
    export const insert2 = <T>(x: T, H: Heap<T>): Heap<T> =>
        (isEmpty(H) ?
            <Heap<T>>(h => h(1, x, EmptyHeap, EmptyHeap))
        : x < findMin(H) ?
            makeHeap(x, H, EmptyHeap)
        : makeHeap(findMin(H), left(H), insert2(x, right(H))));

    const mapToHeapSingletons = <T>(L: List.List<T>): List.List<Heap<T>> =>
        (List.isEmpty(L) ? List.EmptyList
        : List.cons(
            <Heap<T>>(h => h(1, List.head(L), EmptyHeap, EmptyHeap)),
            mapToHeapSingletons(List.tail(L))));

    const linearHeapMerge = <T>(L: List.List<Heap<T>>): Heap<T> =>
        (List.isEmpty(L) ? EmptyHeap
        : merge(List.head(L),
            linearHeapMerge(List.tail(L))));

    const logNHeapMerge = <T>(L: List.List<Heap<T>>): Heap<T> =>
        (List.length(L) <= 2 ?
            linearHeapMerge(L)
        : merge(
            logNHeapMerge(List.slice(L, 0, Math.floor(List.length(L) / 2))),
            logNHeapMerge(
                List.slice(L, Math.floor(List.length(L) / 2), List.length(L)))));

    export const fromList = <T>(L: List.List<T>): Heap<T> =>
        logNHeapMerge(mapToHeapSingletons(L));
}
