/*

FIFO Queue data structure using two List objects
head and tail have an amortized cost of O(1)

It uses tail call optimization, so the size of the deque
is not limited by the call stack size.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

namespace BatchedQueue {
    export type Queue<T> = (f: Selector<T>) => List.List<T>;

    type Selector<T> = (L: List.List<T>, R: List.List<T>) => List.List<T>;

    const left = <T>(Q: Queue<T>) => Q((L, R) => L);

    const right = <T>(Q: Queue<T>) => Q((L, R) => R);

    export const EmptyQueue = <Queue<any>>(Q => Q(List.EmptyList, List.EmptyList));

    export const isEmpty = <T>(Q: Queue<T>) =>
        (List.isEmpty(left(Q)) && List.isEmpty(right(Q)));

    const createQueue = <T>(L: List.List<T>, R: List.List<T>): Queue<T> =>
        <Queue<T>>(Q => Q(L, R));

    const check = <T>(Q: Queue<T>): Queue<T> =>
        (List.isEmpty(left(Q)) ?
            createQueue(List.reverse(right(Q)), List.EmptyList)
        : Q);

    // "cons" backwards since we add to the "back" of the queue
    export const snoc = <T>(e: T, Q: Queue<T>): Queue<T> =>
        check(createQueue(left(Q), List.cons(e, right(Q))));

    export const head = <T>(Q: Queue<T>): T =>
        (List.isEmpty(left(Q)) ? Util.raise('EmptyQueue')
        : List.head(left(Q)));

    export const tail = <T>(Q: Queue<T>): Queue<T> =>
        (List.isEmpty(left(Q)) ? Util.raise('EmptyQueue')
        : createQueue(List.tail(left(Q)), right(Q)));
}
