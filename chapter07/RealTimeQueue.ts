/*

Real-time queue data structure
which uses a schedule stream to order
the forcing of suspensions so that
all queue operations are O(1) even in
the worst case.

*/

import { Stream } from '../chapter04/Stream';
import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace RealTimeQueue {
    export type Queue<T> = (f: Selector<T>) => (Stream.Stream<T> | List.List<T>);

    type Selector<T> =
        (front: Stream.Stream<T>, rear: List.List<T>, sched: Stream.Stream<T>) =>
            (Stream.Stream<T> | List.List<T>);

    const front = <T>(Q: Queue<T>) => <Stream.Stream<T>>Q((f, r, s) => f);

    const rear = <T>(Q: Queue<T>) => <List.List<T>>Q((f, r, s) => r);

    const schedule = <T>(Q: Queue<T>) => <Stream.Stream<T>>Q((f, r, s) => s);

    const createQueue = <T>(f: Stream.Stream<T>, r: List.List<T>, s: Stream.Stream<T>) =>
        (<Queue<T>>(Q => Q(f, r, s)));

    const EmptyQueue: Queue<any> = createQueue(
        Stream.EmptyStream, List.EmptyList, Stream.EmptyStream);

    const isEmpty = (Q: Queue<any>) => Stream.isEmpty(front(Q));

    // Rotation occurs when |r| = |f| + 1
    const rotate =
        <T>(f: Stream.Stream<T>, r: List.List<T>, s: Stream.Stream<T>): Stream.Stream<T> =>
            (Stream.isEmpty(f) ?
                Stream.cons(List.head(r), s)
            : Stream.cons(
                Stream.head(f),
                rotate(
                    Stream.tail(f),
                    List.tail(r),
                    Stream.cons(List.head(r), s))));

    // Maintains the invariant that |s| = |f| - |r|
    const exec = <T>(f: Stream.Stream<T>, r: List.List<T>, s: Stream.Stream<T>): Queue<T> => {
        if (Stream.isEmpty(s)) {
            let newFront = rotate(f, r, Stream.EmptyStream);
            return createQueue(newFront, List.EmptyList, newFront);
        }
        return createQueue(f, r, Stream.tail(s));
    };

    export const snoc = <T>(e: T, Q: Queue<T>): Queue<T> =>
        exec(front(Q), List.cons(e, rear(Q)), schedule(Q));

    export const head = <T>(Q: Queue<T>): T =>
        (isEmpty(Q) ?
            Util.raise('Empty')
        : Stream.head(front(Q)));

    export const tail = <T>(Q: Queue<T>): Queue<T> =>
        (isEmpty(Q) ?
            Util.raise('Empty')
        : exec(Stream.tail(front(Q)), rear(Q), schedule(Q)));

    // Solution to exercise 7.3
    export const size = (Q: Queue<any>): number =>
        ((2 * List.length(rear(Q))) + Stream.length(schedule(Q)));
}
