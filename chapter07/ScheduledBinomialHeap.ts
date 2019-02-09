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

    const insTree = <T>(d: Digit<T>, ds: DigitStream<T>): DigitStream<T> => {
        let helper = Util.optimize<DigitStream<T>>(
            (d: Digit<T>, ds: DigitStream<T>) =>
                (Stream.isEmpty(ds) ?
                    Stream.cons(d, Stream.EmptyStream)
                : (isZero(Stream.head(ds)) ?
                    Stream.cons(d, Stream.tail(ds))
                : Util.optRecurse(() =>
                    Stream.cons(
                        Zero,
                        insTree(
                            link(<Tree<T>>d, <Tree<T>>Stream.head(ds)),
                            Stream.tail(ds)))))));
        return <DigitStream<T>>helper(d, ds);
    }

    // const mrg = <T>(ds1: DigitStream<T>, ds2: DigitStream<T>): DigitStream<T> => {}

    type Schedule<T> = List.List<DigitStream<T>>;

    export type Heap<T> = (f: HeapSelector<T>) => (DigitStream<T> | Schedule<T>);

    type HeapSelector<T> = (d: DigitStream<T>, s: Schedule<T>) =>
        (DigitStream<T> | Schedule<T>);

    const digits = <T>(H: Heap<T>) => <DigitStream<T>>H((d, s) => d);

    const schedule = <T>(H: Heap<T>) => <Schedule<T>>H((d, s) => s);

    const createHeap = <T>(d: DigitStream<T>, s: Schedule<T>) =>
        (<Heap<T>>(H => H(d, s)));

    export const Empty = createHeap(Stream.EmptyStream, List.EmptyList);

    export const isEmpty = <T>(H: Heap<T>) => Stream.isEmpty(digits(H));
}
