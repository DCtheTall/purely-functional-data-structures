/*

Scheduled lazy evaluated bottom up merge sort.
Supports insert that runs in O(log(N)) time in
the worst case and a sort that runs in O(n).

*/

import { List } from '../chapter02/List';
import { Stream } from '../chapter04/Stream';

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

    // TODO add, sort
}
