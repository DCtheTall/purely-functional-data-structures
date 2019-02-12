/*

Implementation of a deque which uses
the banker's method to achieve O(1)
amortized bounds on each operation.
It also can reverse in O(1) time.

*/

import { Stream } from '../chapter04/Stream';
import { Util } from '../util';

// TODO(?) reimplement as a function of an integer
// which returns a class with the constant used for
// balancing (in this example it's 2).
export namespace BankersDeque {
    export type Deque<T> = (f: Selector<T>) => (number | Stream.Stream<T>);

    type Selector<T> =
        (fLen: number, front: Stream.Stream<T>, rLen: number,
            rear: Stream.Stream<T>) => (number | Stream.Stream<T>);

    const frontLen = (D: Deque<any>) => <number>D((fL, f, rL, r) => fL);

    const front = <T>(D: Deque<T>) => <Stream.Stream<T>>D((fL, f, rL, r) => f);

    const rearLen = (D: Deque<any>) => <number>D((fL, f, rL, r) => rL);

    const rear = <T>(D: Deque<T>) => <Stream.Stream<T>>D((fL, f, rL, r) => r);

    const createDeque =
        <T>(fLen: number, f: Stream.Stream<T>, rLen: number, r: Stream.Stream<T>) =>
            (<Deque<T>>(D => D(fLen, f, rLen, r)));

    export const EmptyDeque = createDeque(0, Stream.EmptyStream, 0, Stream.EmptyStream);

    export const isEmpty = (D: Deque<any>) => ((frontLen(D) + rearLen(D)) === 0);

    const check = <T>(D: Deque<T>): Deque<T> => {
        if (frontLen(D) > ((2 * rearLen(D)) + 1)) {
            let i = Math.floor((frontLen(D) + rearLen(D)) / 2);
            return createDeque(
                i,
                Stream.take(i, front(D)),
                frontLen(D) + rearLen(D) - i,
                Stream.concat(
                    rear(D),
                    Stream.reverse(Stream.drop(i, front(D)))));
        }
        if (rearLen(D) > ((2 * frontLen(D)) + 1)) {
            let i = Math.floor((frontLen(D) + rearLen(D)) / 2);
            return createDeque(
                frontLen(D) + rearLen(D) - i,
                Stream.concat(
                    front(D),
                    Stream.reverse(Stream.drop(i, rear(D)))),
                i,
                Stream.take(i, rear(D))
            );
        }
        return D;
    };

    export const cons = <T>(x: T, D: Deque<T>): Deque<T> =>
        check(createDeque(
            frontLen(D) + 1,
            Stream.cons(x, front(D)),
            rearLen(D),
            rear(D)));

    export const head = <T>(D: Deque<T>): T =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (frontLen(D) === 0 ?
            Stream.head(rear(D))
        : Stream.head(front(D))));

    export const tail = <T>(D: Deque<T>): Deque<T> =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (frontLen(D) === 0 ?
            EmptyDeque
        : check(createDeque(
            frontLen(D) - 1,
            Stream.tail(front(D)),
            rearLen(D),
            rear(D)))));

    export const snoc = <T>(x: T, D: Deque<T>): Deque<T> =>
        check(createDeque(
            frontLen(D),
            front(D),
            rearLen(D) + 1,
            Stream.cons(x, rear(D))));

    export const last = <T>(D: Deque<T>): T =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (rearLen(D) === 0 ?
            Stream.head(front(D))
        : Stream.head(rear(D))));

    export const init = <T>(D: Deque<T>): Deque<T> =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (rearLen(D) === 0 ?
            EmptyDeque
        : check(createDeque(
            frontLen(D),
            front(D),
            rearLen(D) - 1,
            Stream.tail(rear(D))))));

    export const reverse = <T>(D: Deque<T>): Deque<T> =>
        createDeque(
            rearLen(D),
            rear(D),
            frontLen(D),
            front(D));
}
