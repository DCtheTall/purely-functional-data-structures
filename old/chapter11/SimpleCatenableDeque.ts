/*

Deque data structure that supports list operations
in O(1) amortized time and concatenation in O(log(N))
amortized time.

*/

import { RealTimeDeque } from '../chapter08/RealTimeDeque';
import { Util } from '../util';

export namespace SimpleCatenableDeque {
    enum Labels { SHALLOW, DEEP };

    type Deque<T> = RealTimeDeque.Deque<T>;

    export type Cat<T> = (f: ShallowSelector<T> | DeepSelector<T>) =>
        (Labels | Deque<T> | Util.Suspension<Cat<Deque<T>>>);

    type ShallowSelector<T> = (lbl: Labels.SHALLOW, q: Deque<T>) =>
        (Labels.SHALLOW | Deque<T>);

    type DeepSelector<T> =
        (lbl: Labels.DEEP, f: Deque<T>, m: Util.Suspension<Cat<Deque<T>>>, r: Deque<T>) =>
            (Labels.DEEP | Deque<T> | Util.Suspension<Cat<Deque<T>>>);

    const label = (C: Cat<any>) => <Labels>C(l => l);

    const isShallow = (C: Cat<any>) => (label(C) === Labels.SHALLOW);

    const front = <T>(C: Cat<T>) => <Deque<T>>C((l, f) => f);

    const middle = <T>(C: Cat<T>) =>
        (<Util.Suspension<Cat<Deque<T>>>>C((l, f, m, r) => m));

    const rear = <T>(C: Cat<T>) => <Deque<T>>C((l, f, m, r) => r);

    const createShallow = <T>(D: Deque<T>) =>
        (<Cat<T>>((C: ShallowSelector<T>) => C(Labels.SHALLOW, D)));

    const createDeep =
        <T>(f: Deque<T>, m: Util.Suspension<Cat<Deque<T>>>, r: Deque<T>) =>
            (<Cat<T>>((C: DeepSelector<T>) => C(Labels.DEEP, f, m, r)));

    const tooSmall = <T>(D: Deque<T>) =>
        (RealTimeDeque.isEmpty(D) || RealTimeDeque.isEmpty(RealTimeDeque.tail(D)));

    const dappendL = <T>(d1: Deque<T>, d2: Deque<T>): Deque<T> =>
        (RealTimeDeque.isEmpty(d1) ?
            d2
        : RealTimeDeque.cons(RealTimeDeque.head(d1), d2));

    const dappendR = <T>(d1: Deque<T>, d2: Deque<T>): Deque<T> =>
        (RealTimeDeque.isEmpty(d2) ?
            d1
        : RealTimeDeque.snoc(d1, RealTimeDeque.head(d2)));

    export const EmptyCat = createShallow(RealTimeDeque.EmptyDeque);

    export const isEmpty = (C: Cat<any>) =>
        (isShallow(C) && RealTimeDeque.isEmpty(front(C)));

    export const cons = <T>(x: T, C: Cat<T>): Cat<T> =>
        (isShallow(C) ?
            createShallow(RealTimeDeque.cons(x, front(C)))
        : createDeep(
            RealTimeDeque.cons(x, front(C)),
            middle(C),
            rear(C)));

    export const snoc = <T>(C: Cat<T>, x: T): Cat<T> =>
        (isShallow(C) ?
            createShallow(RealTimeDeque.snoc(front(C), x))
        : createDeep(
            front(C),
            middle(C),
            RealTimeDeque.snoc(rear(C), x)));

    export const head = <T>(C: Cat<T>): T =>
        (isEmpty(C) ?
            Util.raise('EmptyCat')
        : RealTimeDeque.head(front(C)));

    export const last = <T>(C: Cat<T>): T =>
        (isEmpty(C) ?
            Util.raise('EmptyCat')
        : (isShallow(C) ?
            RealTimeDeque.last(front(C))
        : RealTimeDeque.last(rear(C))));

    export const tail = <T>(C: Cat<T>): Cat<T> => {
        if (isEmpty(C))
            Util.raise('EmptyCat');
        if (isShallow(C))
            return createShallow(RealTimeDeque.tail(front(C)));
        let fprime = RealTimeDeque.tail(front(C));
        if (!tooSmall(fprime))
            return createDeep(fprime, middle(C), rear(C));
        if (isEmpty(Util.force(middle(C))))
            return createShallow(dappendL(fprime, rear(C)));
        return createDeep(
            dappendL(fprime, head(Util.force(middle(C)))),
            Util.lazy(() => tail(Util.force(middle(C)))),
            rear(C));
    };

    export const init = <T>(C: Cat<T>): Cat<T> => {
        if (isEmpty(C))
            Util.raise('EmptyCat');
        if (isShallow(C))
            return createShallow(RealTimeDeque.init(front(C)));
        let rprime = RealTimeDeque.init(rear(C));
        if (!tooSmall(rprime))
            return createDeep(front(C), middle(C), rprime);
        if (isEmpty(Util.force(middle(C))))
            return createShallow(dappendR(front(C), rprime));
        return createDeep(
            front(C),
            Util.lazy(() => init(Util.force(middle(C)))),
            dappendR(last(Util.force(middle(C))), rprime));
    };

    export const concat = <T>(C1: Cat<T>, C2: Cat<T>): Cat<T> =>
        (isShallow(C1) && isShallow(C1) ?
            (tooSmall(front(C1)) ?
                createShallow(dappendL(front(C1), front(C2)))
            : (tooSmall(front(C2)) ?
                createShallow(dappendR(front(C1), front(C2)))
            : createDeep(
                front(C1),
                Util.lazy(() => EmptyCat),
                front(C2))))
        : (isShallow(C1) ?
            (tooSmall(front(C1)) ?
                createDeep(
                    dappendL(front(C1), front(C2)),
                    middle(C2),
                    rear(C2))
            : createDeep(
                front(C1),
                Util.lazy(() => cons(front(C2), Util.force(middle(C2)))),
                rear(C2)))
        : (isShallow(C2) ?
            (tooSmall(front(C2)) ?
                createDeep(
                    front(C1),
                    middle(C1),
                    dappendR(rear(C1), front(C2)))
            : createDeep(
                front(C1),
                Util.lazy(() => snoc(Util.force(middle(C1)), rear(C1))),
                front(C2)))
        : createDeep(
            front(C1),
            Util.lazy(() => concat(
                snoc(Util.force(middle(C1)), rear(C1)),
                cons(front(C2), Util.force(middle(C2))))),
            rear(C2)))))
}
