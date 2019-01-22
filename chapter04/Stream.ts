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
    export const concat = <T>(s: Stream<T>, t: Stream<T>): Util.LazyFunction<Stream<T>> =>
        Util.lazy(() => {
            let helper = Util.optimize((s: Stream<T>, t: Stream<T>): Stream<T> =>
                (isEmpty(s) ? t
                : <Stream<T>>Util.optRecurse(
                    () => cons(head(s), <Stream<T>>Util.force(concat(tail(s), t))))));
            return helper(s, t);
        });

    // Take the first n elements in the stream
    export const take = <T>(n: number, s: Stream<T>): Util.LazyFunction<Stream<T>> =>
        Util.lazy(() => {
            let helper = Util.optimize((n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? EmptyStream
                : <Stream<T>>Util.optRecurse(
                    () => cons(head(s), <Stream<T>>Util.force(take(n - 1, tail(s))))))));
            return helper(n, s);
        });

    // Drop the first n elements in the stream
    export const drop = <T>(n: number, s: Stream<T>): Util.LazyFunction<Stream<T>> =>
        Util.lazy(() => {
            let helper = Util.optimize((n: number, s: Stream<T>): Stream<T> =>
                (isEmpty(s) ? EmptyStream
                : (n === 0 ? s
                : <Stream<T>>Util.optRecurse(
                    () => Util.force(drop(n - 1, tail(s)))))));
            return helper(n, s);
        });

    // Solution to exercise 4.2
    // export const sort = ...
}



