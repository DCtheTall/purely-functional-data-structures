/*

Functional lazy Stream package.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace Stream {
    type StreamCell<T> = (f: Selector<T>) => (T | Stream<T>);

    type Selector<T> = (e: T, S: Stream<T>) => (T | Stream<T>);

    export type Stream<T> = Util.Suspension<StreamCell<T>>;

    const EmptyCell: StreamCell<any> = null;

    export const EmptyStream: Stream<any> = Util.lazy(() => EmptyCell);

    export const isEmpty = <T>(S: Stream<T>) => (Util.force(S) === EmptyCell);

    export const head = <T>(S: Stream<T>) => {
        if (isEmpty(S)) Util.raise('EmptyStream');
        let s = Util.force(S);
        return <T>s((h, t) => h);
    };

    export const tail = <T>(S: Stream<T>) => {
        if (isEmpty(S)) Util.raise('EmptyStream');
        let s = Util.force(S);
        return <Stream<T>>s((h, t) => t);
    };

    export const cons = <T>(e: T, S: Stream<T>): Stream<T> =>
        Util.lazy(() => <StreamCell<T>>((f: Selector<T>) => f(e, S)));

    // Concat two streams
    export const concat = <T>(A: Stream<T>, B: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let helper = (A: Stream<T>, B: Stream<T>): Stream<T> =>
                (isEmpty(A) ? B
                : cons(head(A), concat(tail(A), B)));
            return Util.force(<Stream<T>>helper(A, B));
        });

    // Take the first n elements in the stream
    export const take = <T>(n: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let helper = (n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? EmptyStream
                : cons(head(s), <Stream<T>>take(n - 1, tail(s)))));
            return Util.force(<Stream<T>>helper(n, s));
        });

    // Drop the first n elements in the stream
    export const drop = <T>(n: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let helper = (n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? s
                : drop(n - 1, tail(s))));
            return Util.force(<Stream<T>>helper(n, s));
        });

    // 2nd implementation of drop using a helper function
    export const drop2 = <T>(n: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let dropHelper = (n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? s
                : dropHelper(n - 1, tail(s))));
            return Util.force(dropHelper(n, s));
        });

    // Solution to exercise 4.2
    // Return the first k unique least elements in the stream
    export const sort = <T>(k: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let findMinAboveLowerBound = (s: Stream<T>, lb: T, cur: T) =>
                (s === EmptyStream ? cur
                : (cur === null ?
                    findMinAboveLowerBound(tail(s), lb, head(s))
                : ((cur > head(s)) && ((lb === null) || (head(s) > lb)) ?
                    findMinAboveLowerBound(tail(s), lb, head(s))
                : findMinAboveLowerBound(tail(s), lb, cur))));

            let sortHelper = (k: number, s: Stream<T>, lb: T): Stream<T> => {
                let min = findMinAboveLowerBound(s, lb, null);
                let helper = (k: number, s: Stream<T>, lb: T) =>
                    (k === 0 ? EmptyStream
                    : (s === EmptyStream ? EmptyStream
                    : cons(min, sortHelper(k - 1, s, min))));
                return <Stream<T>>helper(k, s, lb);
            };
            return Util.force(sortHelper(k, s, null));
        });

    // Reverse a stream lazily in O(n) operations
    export const reverse = <T>(S: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let reverseHelper = (L: Stream<T>, R: Stream<T>): Stream<T> =>
                (isEmpty(R) ? L
                : reverseHelper(cons(head(R), L), tail(R)));
            return Util.force(reverseHelper(EmptyStream, S));
        });

    export const length = (S: Stream<any>): number =>
        (isEmpty(S) ? 0
        : 1 + length(tail(S)));

    export const listToStream = <T>(L: List.List<T>): Stream<T> =>
        (List.isEmpty(L) ?
            EmptyStream
        : Stream.cons(
            List.head(L),
            listToStream(List.tail(L))));

    export const streamToList = <T>(S: Stream<T>): List.List<T> =>
        (isEmpty(S) ?
            List.EmptyList
        : List.cons(
            head(S),
            streamToList(tail(S))));
}


