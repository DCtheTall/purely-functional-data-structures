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
        let s = Util.force(S)
        return <T>s((h, t) => h);
    };

    const tail = <T>(S: Stream<T>) => {
        let s = Util.force(S)
        return <Stream<T>>s((h, t) => t);
    };

    // TODO do not export
    export const cons = <T>(e: T, S: Stream<T>): Stream<T> =>
        Util.lazy(() => (f: Selector<T>) => f(e, S));

    export const append = <T>(s: Stream<T>, t: Stream<T>): Stream<T> =>
        (isEmpty(s) ? t
        : cons(head(s), append(tail(s), t)));
}

let s = Stream.EmptyStream;
for (let i = 0; i < 1e3; i++) {
    s = Stream.cons(i, s);
}



