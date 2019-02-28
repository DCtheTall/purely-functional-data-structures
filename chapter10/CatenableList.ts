/*

A list implementation which allows concatenation with
an O(1) amortized cost.

*/

import { RealTimeQueue } from '../chapter07/RealTimeQueue';
import { Util } from '../util';

export namespace CatenableList {
    export type Cat<T> = (f: Selector<T>) => (T | SuspendedCatQueue<T>);

    type Selector<T> = (el: T, q: SuspendedCatQueue<T>) =>
        (T | SuspendedCatQueue<T>);

    type SuspendedCatQueue<T> = RealTimeQueue.Queue<Util.Suspension<Cat<T>>>;

    const valueof = <T>(C: Cat<T>) => <T>C((v, q) => v);

    const queue = <T>(C: Cat<T>) => <SuspendedCatQueue<T>>C((v, q) => q);

    const createCat = <T>(val: T, q: SuspendedCatQueue<T>) =>
        (<Cat<T>>(C => C(val, q)))

    export const EmptyCat = <Cat<any>>null;

    export const isEmpty = (C: Cat<any>) => (C === EmptyCat);

    const link = <T>(A: Cat<T>, B: Util.Suspension<Cat<T>>): Cat<T> =>
        createCat(valueof(A), RealTimeQueue.snoc(B, queue(A)));

    const linkAll = <T>(Q: SuspendedCatQueue<T>): Cat<T> =>
        (RealTimeQueue.isEmpty(RealTimeQueue.tail(Q)) ?
            Util.force(RealTimeQueue.head(Q))
        : link(
            Util.force(RealTimeQueue.head(Q)),
            () => linkAll(RealTimeQueue.tail(Q))));

    export const concat = <T>(A: Cat<T>, B: Cat<T>): Cat<T> =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : link(A, () => B)));

    export const cons = <T>(x: T, C: Cat<T>): Cat<T> =>
        concat(createCat(x, RealTimeQueue.EmptyQueue), C);

    export const snoc = <T>(x: T, C: Cat<T>): Cat<T> =>
        concat(C, createCat(x, RealTimeQueue.EmptyQueue));

    export const head = <T>(C: Cat<T>): T =>
        (isEmpty(C) ?
            Util.raise('EmptyCat')
        : valueof(C));

    export const tail = <T>(C: Cat<T>): Cat<T> =>
        (isEmpty(C) ?
            Util.raise('EmptyCat')
        : linkAll(queue(C)));
}
