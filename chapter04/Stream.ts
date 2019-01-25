/*

Functional lazy Stream package.

*/

import { Util } from '../util';

export namespace Stream {
    type StreamCell<T> = (f: Selector<T>) => (T | Stream<T>);

    type Selector<T> = (e: T, S: Stream<T>) => (T | Stream<T>);

    export type Stream<T> = Util.LazyFunction<StreamCell<T>>;

    const EmptyCell: StreamCell<any> = null;

    export const EmptyStream: Stream<any> = Util.lazy(() => EmptyCell);

    const isEmpty = <T>(S: Stream<T>) => (Util.force(S) === EmptyCell);

    const head = <T>(S: Stream<T>) => {
        if (isEmpty(S)) Util.raise('EmptyStream');
        let s = Util.force(S);
        return <T>s((h, t) => h);
    };

    const tail = <T>(S: Stream<T>) => {
        if (isEmpty(S)) Util.raise('EmptyStream');
        let s = Util.force(S);
        return <Stream<T>>s((h, t) => t);
    };

    const cons = <T>(e: T, S: Stream<T>): Stream<T> =>
        Util.lazy((): StreamCell<T> => (f: Selector<T>) => f(e, S));

    // Concat two streams
    export const concat = <T>(s: Stream<T>, t: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let helper = Util.optimize<Stream<T>>((s: Stream<T>, t: Stream<T>): Stream<T> =>
                (isEmpty(s) ? t
                : <Stream<T>>Util.optRecurse(
                    () => cons(head(s), concat(tail(s), t)))));
            return Util.force(<Stream<T>>helper(s, t));
        });

    // Take the first n elements in the stream
    export const take = <T>(n: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let helper = Util.optimize<Stream<T>>((n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? EmptyStream
                : <Stream<T>>Util.optRecurse(
                    () => cons(head(s), <Stream<T>>take(n - 1, tail(s)))))));
            return Util.force(<Stream<T>>helper(n, s));
        });

    // Drop the first n elements in the stream
    export const drop = <T>(n: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let helper = Util.optimize<Stream<T>>((n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? s
                : <Stream<T>>Util.optRecurse(
                    () => Util.force(drop(n - 1, tail(s)))))));
            return Util.force(<Stream<T>>helper(n, s));
        });

    // 2nd implementation of drop using a helper function
    export const drop2 = <T>(n: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let dropHelper = (n: number, s: Stream<T>): Stream<T> => {
                let helper = Util.optimize<Stream<T>>((n: number, s: Stream<T>) =>
                    (isEmpty(s) ? EmptyStream
                    : (n === 0 ? s
                    : <Stream<T>>Util.optRecurse(
                        () => dropHelper(n - 1, tail(s))))));
                return <Stream<T>>helper(n, s);
            };
            return Util.force(dropHelper(n, s));
        });

    // Solution to exercise 4.2
    // Return the first k unique least elements in the stream
    export const sort = <T>(k: number, s: Stream<T>): Stream<T> =>
        Util.lazy<StreamCell<T>>(() => {
            let findMinAboveLowerBound = Util.optimize<T>((s: Stream<T>, lb: T, cur: T) =>
                (s === EmptyStream ? cur
                : (cur === null ?
                    Util.optRecurse(
                        () => findMinAboveLowerBound(tail(s), lb, head(s)))
                : ((cur > head(s)) && ((lb === null) || (head(s) > lb)) ?
                    Util.optRecurse(
                        () => findMinAboveLowerBound(tail(s), lb, head(s)))
                : Util.optRecurse(
                        () => findMinAboveLowerBound(tail(s), lb, cur))))));
            let sortHelper = (k: number, s: Stream<T>, lb: T): Stream<T> => {
                let min = findMinAboveLowerBound(s, lb, null);
                let helper = Util.optimize<Stream<T>>((k: number, s: Stream<T>, lb: T) =>
                    (k === 0 ? EmptyStream
                    : (s === EmptyStream ? EmptyStream
                    : Util.optRecurse(
                        () => cons(min, sortHelper(k - 1, s, min))))));
                return <Stream<T>>helper(k, s, lb);
            };
            return Util.force(sortHelper(k, s, null));
        });
}



