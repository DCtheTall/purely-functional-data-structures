/*

Lazy binomial heap which uses a schedule
to achieve findMin in O(1) worst case time,
deleteMin and insert in O(log(n)) worst case
time.

*/

import { List } from '../chapter02/List';
import { Stream } from '../chapter04/Stream';
import { Util } from '../util';

export namespace ScheduledBinomialHeap {
    type Tree<T> = (f: TreeSelector<T>) => (T | TreeList<T>);

    type TreeList<T> = List.List<Tree<T>>;

    type TreeSelector<T> = (el: T, children: TreeList<T>) => (T | TreeList<T>);

    const valueof = <T>(t: Tree<T>) => <T>t((v, c) => v);

    const children = <T>(t: Tree<T>) => <TreeList<T>>t((v, c) => c);

    const createTree = <T>(val: T, ch: TreeList<T>) =>
        (<Tree<T>>(T => T(val, ch)));

    const link = <T>(t1: Tree<T>, t2: Tree<T>) =>
        (valueof(t1) <= valueof(t2) ?
            createTree(valueof(t1), List.cons(t2, children(t1)))
        : createTree(valueof(t2), List.cons(t1, children(t2))));

    type Digit<T> = 'Zero' | Tree<T>;

    const Zero = 'Zero';

    const isZero = (d: Digit<any>) => (d === Zero);

    type DigitStream<T> = Stream.Stream<Digit<T>>;

    const insTree = <T>(d: Digit<T>, ds: DigitStream<T>): DigitStream<T> =>
        (Stream.isEmpty(ds) ?
            Stream.cons(d, Stream.EmptyStream)
        : (isZero(Stream.head(ds)) ?
            Stream.cons(d, Stream.tail(ds))
        : Stream.cons(
            Zero,
            insTree(
                link(<Tree<T>>d, <Tree<T>>Stream.head(ds)),
                Stream.tail(ds)))));

    const mrg = <T>(ds1: DigitStream<T>, ds2: DigitStream<T>): DigitStream<T> =>
        (Stream.isEmpty(ds1) ? ds2
        : (Stream.isEmpty(ds2) ? ds1
        : (isZero(List.head(ds1)) ?
            Stream.cons(
                Stream.head(ds2),
                mrg(Stream.tail(ds1), Stream.tail(ds2)))
        : (isZero(List.head(ds2)) ?
            Stream.cons(
                Stream.head(ds1),
                mrg(Stream.tail(ds1), Stream.tail(ds2)))
        : Stream.cons(
            Zero,
            insTree(
                link(<Tree<T>>Stream.head(ds1), <Tree<T>>Stream.head(ds2)),
                mrg(Stream.tail(ds1), Stream.tail(ds2))))))));

    const normalize = <T>(ds: DigitStream<T>): DigitStream<T> => {
        if (!Stream.isEmpty(ds))
            normalize(Stream.tail(ds));
        return ds;
    }

    // Returns a stream whose head is the minimum tree in the digit stream
    const removeMinTree = <T>(ds: DigitStream<T>): DigitStream<T> => {
        if (Stream.isEmpty(ds))
            Util.raise('Empty');
        if (Stream.isEmpty(Stream.tail(ds)) && !isZero(Stream.head(ds)))
            return ds;
        let val = removeMinTree(Stream.tail(ds));
        if (isZero(Stream.head(ds))) {
            return Stream.cons(
                Stream.head(val),
                Stream.cons(Zero, Stream.tail(ds)));
        }
        if (valueof(<Tree<T>>Stream.head(ds)) <=
            valueof(<Tree<T>>Stream.head(val)))
                return Stream.cons(
                    Stream.head(ds),
                    Stream.cons(Zero, Stream.tail(ds)));
        return Stream.cons(
            Stream.head(val),
            Stream.cons(Stream.head(ds), Stream.tail(val)));
    }

    type Schedule<T> = List.List<DigitStream<T>>;

    export type Heap<T> = (f: HeapSelector<T>) => (DigitStream<T> | Schedule<T>);

    type HeapSelector<T> = (d: DigitStream<T>, s: Schedule<T>) =>
        (DigitStream<T> | Schedule<T>);

    const digits = <T>(H: Heap<T>) => <DigitStream<T>>H((d, s) => d);

    const schedule = <T>(H: Heap<T>) => <Schedule<T>>H((d, s) => s);

    const exec = <T>(s: Schedule<T>): Schedule<T> =>
        (List.isEmpty(s) ?
            List.EmptyList
        : (isZero(Stream.head(List.head(s))) ?
            List.cons(
                Stream.tail(List.head(s)),
                List.tail(s))
        : List.tail(s)));

    const createHeap = <T>(d: DigitStream<T>, s: Schedule<T>) =>
        (<Heap<T>>(H => H(d, s)));

    export const Empty = createHeap(Stream.EmptyStream, List.EmptyList);

    export const isEmpty = <T>(H: Heap<T>) => Stream.isEmpty(digits(H));

    export const insert = <T>(x: T, H: Heap<T>): Heap<T> => {
        let ds = insTree(createTree(x, List.EmptyList), digits(H));
        return createHeap(ds, exec(exec(List.cons(ds, schedule(H)))));
    };

    export const merge = <T>(h1: Heap<T>, h2: Heap<T>): Heap<T> =>
        createHeap(
            normalize(mrg(digits(h1), digits(h2))),
            List.EmptyList);

    export const findMin = <T>(H: Heap<T>): T =>
        valueof(<Tree<T>>Stream.head(removeMinTree(digits(H))));

    export const deleteMin = <T>(H: Heap<T>): Heap<T> => {
        let val = removeMinTree(digits(H));
        return createHeap(
            normalize(mrg(
                Stream.listToStream(children(<Tree<T>>Stream.head(val))),
                Stream.tail(val))),
            List.EmptyList);
    }
}
