/*

Bootstrapped queue implementation which uses
structural decomposition to get rid of inefficient
evaluating of cascading suspensions in the banker's
queue.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace BootstrappedQueue {
    export type Queue<T> = (f: Selector<T>) =>
        (number | List.List<T> | Collection<T>);

    type Selector<T> =
        (lenfm: number, f: List.List<T>, col: Collection<T>, lenr: number,
            r: List.List<T>) => (number | List.List<T> | Collection<T>);

    type Collection<T> = Queue<Util.Suspension<List.List<T>>>;

    const lenfm = (Q: Queue<any>) => <number>Q((lfm, f, c, lr, r) => lfm);

    const front = <T>(Q: Queue<T>) => <List.List<T>>Q((lfm, f, c, lr, r) => f);

    const collection = <T>(Q: Queue<T>) =>
        (<Collection<T>>Q((lfm, f, c, lr, r) => c));

    const lenr = (Q: Queue<any>) => <number>Q((lfm, f, c, lr, r) => lr);

    const rear = <T>(Q: Queue<T>) => <List.List<T>>Q((lfm, f, c, lr, r) => r);

    const createQueue =
        <T>(lfm: number, f: List.List<T>, c: Collection<T>, lr: number,
            r: List.List<T>) => <Queue<T>>(Q => Q(lfm, f, c, lr, r));

    export const EmptyQueue = <Queue<any>>null;

    export const isEmpty = (Q: Queue<any>) => (Q === EmptyQueue);

    const checkQ = <T>(Q: Queue<T>): Queue<T> =>
        (lenr(Q) <= lenfm(Q) ?
            checkF(Q)
        : checkF(createQueue(
            lenfm(Q) + lenr(Q),
            front(Q),
            snoc(() => List.reverse(rear(Q)), collection(Q)),
            0,
            List.EmptyList)));

    const checkF = <T>(Q: Queue<T>): Queue<T> =>
        (List.isEmpty(front(Q)) && isEmpty(collection(Q)) ?
            EmptyQueue
        : (List.isEmpty(front(Q)) ?
            createQueue(
                lenfm(Q),
                Util.force(head(collection(Q))),
                tail(collection(Q)),
                lenr(Q),
                rear(Q))
        : Q));

    export const snoc = <T>(x: T, Q: Queue<T>): Queue<T> =>
        (isEmpty(Q) ?
            createQueue(
                1,
                List.cons(x, List.EmptyList),
                EmptyQueue,
                0,
                List.EmptyList)
        : checkQ(createQueue(
            lenfm(Q),
            front(Q),
            collection(Q),
            lenr(Q) + 1,
            List.cons(x, rear(Q)))));

    const head = <T>(Q: Queue<T>): T =>
        (isEmpty(Q)?
            Util.raise('EmptyQueue')
        : List.head(front(Q)));

    const tail = <T>(Q: Queue<T>): Queue<T> =>
        (isEmpty(Q) ?
            Util.raise('EmptyQueue')
        : checkQ(createQueue(
            lenfm(Q) - 1,
            List.tail(front(Q)),
            collection(Q),
            lenr(Q),
            rear(Q))));
}
