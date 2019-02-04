/*

A laZy queue data structure which can
be shown to have O(1) amortized cost for
all operations using the physicist's method.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace PhysicistsQueue {
    export type Queue<T> = (f: Selector<T>) =>
        (List.List<T> | number | Util.LazyFunction<List.List<T>>);

    type Selector<T> =
        (w: List.List<T>, fLen: number, front: Util.LazyFunction<List.List<T>>, rLen: number, rear: List.List<T>) =>
            (List.List<T> | number | Util.LazyFunction<List.List<T>>);

    const working = <T>(Q: Queue<T>) => <List.List<T>>Q((w, fL, f, rL, r) => w);

    const fLen = <T>(Q: Queue<T>) => <number>Q((w, fL, f, rL, r) => fL);

    const front = <T>(Q: Queue<T>) => <Util.LazyFunction<List.List<T>>>Q((w, fL, f, rL, r) => f);

    const rLen = <T>(Q: Queue<T>) => <number>Q((w, fL, f, rL, r) => rL);

    const rear = <T>(Q: Queue<T>) => <List.List<T>>Q((w, fL, f, rL, r) => r);

    const createQueue =
        <T>(w: List.List<T>, fLen: number, f: Util.LazyFunction<List.List<T>>, rLen: number, r: List.List<T>) =>
            <Queue<T>>(Q => Q(w, fLen, f, rLen, r));

    export const EmptyQueue =
        <Queue<any>>(Q => Q(List.EmptyList, 0, Util.lazy(() => List.EmptyList), 0, List.EmptyList));

    export const isEmpty = <T>(Q: Queue<T>) => (fLen(Q) === 0);

    const checkw = <T>(Q: Queue<T>): Queue<T> =>
        (List.isEmpty(working(Q)) ?
            createQueue(Util.force(front(Q)), fLen(Q), front(Q), rLen(Q), rear(Q))
        : Q);

    const check = <T>(Q: Queue<T>): Queue<T> =>
        (rLen(Q) <= fLen(Q) ?
            checkw(Q)
        : checkw(createQueue(
            Util.force(front(Q)),
            fLen(Q) + rLen(Q),
            Util.lazy(() => List.concat(Util.force(front(Q)), List.reverse(rear(Q)))),
            0,
            List.EmptyList)));

    export const snoc = <T>(e: T, Q: Queue<T>): Queue<T> =>
        check(createQueue(
            working(Q),
            fLen(Q),
            front(Q),
            rLen(Q) + 1,
            List.cons(e, rear(Q))));

    export const head = <T>(Q: Queue<T>): T =>
        (List.isEmpty(working(Q)) ?
            Util.raise('Empty')
        : List.head(working(Q)));

    export const tail = <T>(Q: Queue<T>): Queue<T> =>
        (List.isEmpty(working(Q)) ?
            Util.raise('Empty')
        : check(createQueue(
            List.tail(working(Q)),
            fLen(Q) - 1,
            Util.lazy(() => List.tail(Util.force(front(Q)))),
            rLen(Q),
            rear(Q))));
}