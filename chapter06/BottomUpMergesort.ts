/*

Bottom-up mergesort

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace BottomUpMergesort {
    type NestedList<T> = List.List<List.List<T>>;

    type SuspendedNestedList<T> = Util.Suspension<NestedList<T>>;

    export type Sortable<T> = (f: Selector<T>) => (number | SuspendedNestedList<T>);

    type Selector<T> = (size: number, segs: SuspendedNestedList<T>) =>
        (number | SuspendedNestedList<T>);

    const size = <T>(S: Sortable<T>) => <number>S((s, L) => s);

    const segments = <T>(S: Sortable<T>) => <SuspendedNestedList<T>>S((s, L) => L);

    const createSortable = <T>(s: number, L: SuspendedNestedList<T>) =>
        (<Sortable<T>>(S => S(s, L)));

    export const Empty = Util.lazy(() => List.EmptyList);

    export const isEmpty = (S: Sortable<any>) => (size(S) === 0);

    const mrg = <T>(xs: List.List<T>, ys: List.List<T>): List.List<T> =>
        (List.isEmpty(xs) ? ys
        : (List.isEmpty(ys) ? xs
        : (List.head(xs) <= List.head(ys) ?
            List.cons(List.head(xs), mrg(List.tail(xs), ys))
        : List.cons(List.head(ys), mrg(xs, List.tail(ys))))));

    const addSeg = <T>(seg: List.List<T>, segs: NestedList<T>, s: number): NestedList<T> =>
        (s % 2 === 0 ?
            List.cons(seg, segs)
        : addSeg(
            mrg(seg, List.head(segs)),
            List.tail(segs), Math.floor(s / 2)));

    // Takes amortized O(log(n)) time
    export const add = <T>(x: T, S: Sortable<T>): Sortable<T> =>
        createSortable(
            size(S) + 1,
            Util.lazy(() => addSeg(
                List.cons(x, List.EmptyList),
                Util.force(segments(S)),
                size(S))));

    // Takes amortized O(n) time
    export const sort = <T>(S: Sortable<T>): List.List<T> => {
        let mergeAll = (xs: List.List<T>, segs: NestedList<T>): List.List<T> =>
            (List.isEmpty(segs) ? xs
            : mergeAll(mrg(xs, List.head(segs)), List.tail(segs)));
        return mergeAll(List.EmptyList, Util.force(segments(S)));
    };
}
