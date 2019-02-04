/*

Amortized queue which uses lazy evaluation to
achieve O(1) amortized cost for each operation

*/

import { Stream } from '../chapter04/Stream';
import { Util } from '../util';

export namespace BankersQueue {
    export type Queue<T> = (f: Selector<T>) => (number | T | Stream.Stream<T>);

    type Selector<T> = (fLen: number, front: Stream.Stream<T>, rLen: number, rear: Stream.Stream<T>) =>
        (number | T | Stream.Stream<T>);

    const createQueue = <T>(fLen: number, f: Stream.Stream<T>, rLen: number, r: Stream.Stream<T>): Queue<T> =>
        Q => Q(fLen, f, rLen, r);

    const fLen = <T>(Q: Queue<T>) => <number>Q((fL, f, rL, r) => fL);

    const front = <T>(Q: Queue<T>) => <Stream.Stream<T>>Q((fL, f, rL, r) => f);

    const rLen = <T>(Q: Queue<T>) => <number>Q((fL, f, rL, r) => rL);

    const rear = <T>(Q: Queue<T>) => <Stream.Stream<T>>Q((fL, f, rL, r) => r);

    export const EmptyQueue = createQueue(0, Stream.EmptyStream, 0, Stream.EmptyStream);

    export const isEmpty = (Q: Queue<any>) => Stream.isEmpty(front(Q));

    const check = <T>(Q: Queue<T>): Queue<T> =>
        (isEmpty(Q) ?
            Util.raise('Empty')
        : (rLen(Q) <= fLen(Q) ?
            Q
        : createQueue(
            rLen(Q) + fLen(Q),
            Stream.concat(front(Q), Stream.reverse(rear(Q))),
            0,
            Stream.EmptyStream)));

    export const snoc = <T>(e: T, Q: Queue<T>): Queue<T> =>
        check(createQueue(
            fLen(Q),
            front(Q),
            rLen(Q) + 1,
            Stream.cons(e, rear(Q))));

    export const head = <T>(Q: Queue<T>): T =>
        (isEmpty(Q) ? Util.raise('Empty')
        : Stream.head(front(Q)));

    export const tail = <T>(Q: Queue<T>): Queue<T> =>
        (isEmpty(Q) ? Util.raise('Empty')
        : check(createQueue(
            fLen(Q) - 1,
            Stream.tail(front(Q)),
            rLen(Q),
            rear(Q))));
}