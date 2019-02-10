/*

Scheduled lazy evaluated bottom up merge sort.
Supports insert that runs in O(log(N)) time in
the worst case and a sort that runs in O(n).

*/

import { List } from '../chapter02/List';
import { Stream } from '../chapter04/Stream';
import { Util } from '../util';

export namespace ScheduledBottomUpMergesort {
    type Schedule<T> = List.List<Stream.Stream<T>>;

    const exec1 = <T>(S: Schedule<T>): Schedule<T> =>
        (List.isEmpty(S) ?
            List.EmptyList
        : (Stream.isEmpty(List.head(S)) ?
            exec1(List.tail(S))
        : List.cons(
            Stream.tail(List.head(S)),
            List.tail(S))));

    type Segment<T> = (f: SegmentSelector<T>) =>
        (Stream.Stream<T> | Schedule<T>);

    type SegmentSelector<T> = (str: Stream.Stream<T>, sched: Schedule<T>) =>
        (Stream.Stream<T> | Schedule<T>);

    const createSegment = <T>(seg: Stream.Stream<T>, sched: Schedule<T>) =>
        (<Segment<T>>(S => S(seg, sched)));

    const segment = <T>(S: Segment<T>) =>
        (<Stream.Stream<T>>S((seg, sched) => seg));

    const schedule = <T>(S: Segment<T>) =>
        (<Schedule<T>>S((seg, sched) => sched));

    const exec2 = <T>(S: Segment<T>): Segment<T> =>
        createSegment(segment(S), exec1(exec1(schedule(S))));

    export type Sortable<T> = (f: Selector<T>) =>
        (number | List.List<Segment<T>>);

    type Selector<T> = (size: number, segments: List.List<Segment<T>>) =>
        (number | List.List<Segment<T>>);

    const createSortable = <T>(size: number, segments: List.List<Segment<T>>) =>
        (<Sortable<T>>(S => S(size, segments)));

    const size = <T>(S: Sortable<T>) =>
        <number>S((sz, segs) => sz);

    const segments = <T>(S: Sortable<T>) =>
        (<List.List<Segment<T>>>S((sz, segs) => segs));

    export const Empty = createSortable(0, List.EmptyList);

    export const isEmpty = <T>(S: Sortable<T>) => (size(S) === 0);

    const mrg = <T>(s1: Stream.Stream<T>, s2: Stream.Stream<T>): Stream.Stream<T> =>
        (Stream.isEmpty(s1) ? s2
        : (Stream.isEmpty(s2) ? s1
        : (Stream.head(s1) <= Stream.head(s2) ?
            Stream.cons(
                Stream.head(s1),
                mrg(Stream.tail(s1), s2))
        : Stream.cons(
            Stream.head(s2),
            mrg(s1, Stream.tail(s2))))));

    const addSeg =
        <T>(xs: Stream.Stream<T>, segs: List.List<Segment<T>>, sz: number,
            rsched: Schedule<T>): List.List<Segment<T>> => {
            if ((sz & 1) == 0)
                return List.cons(
                    createSegment(xs, List.reverse(rsched)),
                    segs);
            let val = mrg(xs, segment(List.head(segs)));
            return addSeg(
                val,
                List.tail(segs),
                Math.floor(sz / 2),
                List.cons(val, rsched));
        };

    const mrgAll = <T>(S: Stream.Stream<T>, L: List.List<Segment<T>>): Stream.Stream<T> =>
        Util.lazy(() => Util.force(
            (List.isEmpty(L) ? S
            : mrgAll(mrg(S, segment(List.head(L))), List.tail(L)))));

    export const add = <T>(x: T, S: Sortable<T>): Sortable<T> =>
        createSortable(
            size(S) + 1,
            addSeg(
                Stream.cons(x, Stream.EmptyStream),
                segments(S),
                size(S),
                List.EmptyList));

    export const sort = <T>(S: Sortable<T>): List.List<T> =>
        Stream.streamToList(mrgAll(Stream.EmptyStream, segments(S)));
}
