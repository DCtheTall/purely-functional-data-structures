/*

Real time deque which supports double-ended
operations in O(1) time in the worst case.
The book uses a balancing factor, c, which
in this implementation is just set to 2.

*/

import { Stream } from "../chapter04/Stream";
import { Util } from "../util";

export namespace RealTimeDeque {
    export type Deque<T> = (f: Selector<T>) => (number | Stream.Stream<T>);

    type Selector<T> =
        (fLen: number, front: Stream.Stream<T>, fSched: Stream.Stream<T>,
            rLen: number, rear: Stream.Stream<T>, rSched: Stream.Stream<T>) =>
                (number | Stream.Stream<T>);

    const frontLen = (D: Deque<any>) => <number>D((fL, f, fS, rL, r, rS) => fL);

    const front = <T>(D: Deque<T>) => <Stream.Stream<T>>D((fL, f, fS, rL, r, rS) => f);

    const frontSched = <T>(D: Deque<T>) => <Stream.Stream<T>>D((fL, f, fS, rL, r, rS) => fS);

    const rearLen = (D: Deque<any>) => <number>D((fL, f, fS, rL, r, rS) => rL);

    const rear = <T>(D: Deque<T>) => <Stream.Stream<T>>D((fL, f, fS, rL, r, rS) => r);

    const rearSched = <T>(D: Deque<T>) => <Stream.Stream<T>>D((fL, f, fS, rL, r, rS) => rS);

    const createDeque =
        <T>(fL: number, f: Stream.Stream<T>, fS: Stream.Stream<T>, rL: number,
            r: Stream.Stream<T>, rS: Stream.Stream<T>) => <Deque<T>>(D => D(fL, f, fS, rL, r, rS));

    export const EmptyDeque = createDeque(
        0,
        Stream.EmptyStream,
        Stream.EmptyStream,
        0,
        Stream.EmptyStream,
        Stream.EmptyStream);

    export const isEmpty = (D: Deque<any>) => ((frontLen(D) + rearLen(D)) === 0);

    const exec1 = <T>(S: Stream.Stream<T>) => (Stream.isEmpty(S) ? S : Stream.tail(S));

    const exec2 = <T>(S: Stream.Stream<T>) => exec1(exec1(S));

    const rotateRev =
        <T>(front: Stream.Stream<T>, rear: Stream.Stream<T>, acc: Stream.Stream<T>): Stream.Stream<T> =>
            (Stream.isEmpty(front) ?
                Stream.concat(Stream.reverse(rear), acc)
            : Stream.cons(
                Stream.head(front),
                rotateRev(
                    Stream.tail(front),
                    Stream.drop(2, rear),
                    Stream.concat(Stream.reverse(Stream.take(2, rear)), acc))));

    const rotateDrop =
        <T>(front: Stream.Stream<T>, j: number, rear: Stream.Stream<T>): Stream.Stream<T> =>
            (j < 2 ? rotateRev(front, Stream.drop(j, rear), Stream.EmptyStream)
            : Stream.cons(
                Stream.head(front),
                rotateDrop(
                    Stream.tail(front),
                    j - 2,
                    Stream.drop(2, rear))));

    const check = <T>(D: Deque<T>): Deque<T> => {
        if (frontLen(D) > ((2 * rearLen(D)) + 1)) {
            let i = Math.floor((frontLen(D) + rearLen(D)) / 2);
            let f = Stream.take(i, front(D));
            let r = rotateDrop(rear(D), i, front(D));
            return createDeque(i, f, f, frontLen(D) + rearLen(D) - i, r, r);
        }
        if (rearLen(D) > ((2 * frontLen(D)) + 1)) {
            let i = Math.floor((frontLen(D) + rearLen(D)) / 2);
            let f = rotateDrop(front(D), i, rear(D));
            let r = Stream.take(i, rear(D));
            return createDeque(frontLen(D) + rearLen(D) - i, f, f, i, r, r);
        }
        return D;
    };

    export const cons = <T>(x: T, D: Deque<T>): Deque<T> =>
        check(createDeque(
            frontLen(D) + 1,
            Stream.cons(x, front(D)),
            exec1(frontSched(D)),
            rearLen(D),
            rear(D),
            exec1(rearSched(D))));

    export const head = <T>(D: Deque<T>) =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (Stream.isEmpty(front(D)) ?
            Stream.head(rear(D))
        : Stream.head(front(D))));

    export const tail = <T>(D: Deque<T>) =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (Stream.isEmpty(front(D)) ?
            EmptyDeque
        : check(createDeque(
            frontLen(D) - 1,
            Stream.tail(front(D)),
            exec2(frontSched(D)),
            rearLen(D),
            rear(D),
            exec2(rearSched(D))))));

    export const snoc = <T>(D: Deque<T>, x: T): Deque<T> =>
        check(createDeque(
            frontLen(D),
            front(D),
            exec1(frontSched(D)),
            rearLen(D) + 1,
            Stream.cons(x, rear(D)),
            exec1(rearSched(D))));

    export const last = <T>(D: Deque<T>) =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (Stream.isEmpty(rear(D)) ?
            Stream.head(front(D))
        : Stream.head(front(D))));

    export const init = <T>(D: Deque<T>) =>
        (isEmpty(D) ?
            Util.raise('Empty')
        : (Stream.isEmpty(rear(D)) ?
            EmptyDeque
        : check(createDeque(
            frontLen(D),
            front(D),
            exec2(frontSched(D)),
            rearLen(D) - 1,
            rear(D),
            exec2(rearSched(D))))));

    export const reverse = <T>(D: Deque<T>): Deque<T> =>
        createDeque(
            rearLen(D),
            rear(D),
            rearSched(D),
            frontLen(D),
            front(D),
            frontSched(D));

    export const size = (D: Deque<any>) => (frontLen(D) + rearLen(D));
}
