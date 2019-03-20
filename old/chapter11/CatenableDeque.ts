/*

Catenable Deque data structure, which supports deque
operations with O(1) amortized cost and concat with
O(1) amortized cost.

*/

import { RealTimeDeque } from '../chapter08/RealTimeDeque';
import { Util } from '../util';

export namespace CatenableDeque {
    type Deque<T> = RealTimeDeque.Deque<T>;

    enum CatLabels { SHALLOW, DEEP };

    export type Cat<T> = (f: ShallowSelector<T> | DeepSelector<T>) =>
        (CatLabels | Deque<T> | Util.Suspension<Cat<CmpdElement<T>>>);

    type ShallowSelector<T> = (lbl: CatLabels.SHALLOW, d: Deque<T>) =>
        (CatLabels.SHALLOW | Deque<T>);

    type DeepSelector<T> =
        (lbl: CatLabels.DEEP, f: Deque<T>, a: Util.Suspension<Cat<CmpdElement<T>>>,
            m: Deque<T>, b: Util.Suspension<Cat<CmpdElement<T>>>, r: Deque<T>) =>
                (CatLabels.DEEP | Deque<T> | Util.Suspension<Cat<CmpdElement<T>>>);

    const label = (C: Cat<any>) => <CatLabels>C(l => l);

    const isShallow = (C: Cat<any>) => (label(C) === CatLabels.SHALLOW);

    const front = <T>(C: Cat<T>) => <Deque<T>>C((l, f) => f);

    const cmpdElemA = <T>(C: Cat<T>) =>
        (<Util.Suspension<Cat<CmpdElement<T>>>>C((l, f, a) => a));

    const middle = <T>(C: Cat<T>) => <Deque<T>>C((l, f, a, m) => m);

    const cmpdElemB = <T>(C: Cat<T>) =>
        (<Util.Suspension<Cat<CmpdElement<T>>>>C((l, f, a, m, b) => b));

    const rear = <T>(C: Cat<T>) => <Deque<T>>C((l, f, a, m, b, r) => r);

    const createShallow = <T>(D: Deque<T>) =>
        (<Cat<T>>((C: ShallowSelector<T>) => C(CatLabels.SHALLOW, D)));

    const createDeep =
        <T>(f: Deque<T>, a: Util.Suspension<Cat<CmpdElement<T>>>, m: Deque<T>,
            b: Util.Suspension<Cat<CmpdElement<T>>>, r: Deque<T>) =>
                (<Cat<T>>((C: DeepSelector<T>) => C(CatLabels.DEEP, f, a, m, b, r)));

    enum CmpdLabels { SIMPLE, COMPOUND };

    type CmpdElement<T> = (f: SimpleSelector<T> | CmpdSelector<T>) =>
        (CmpdLabels | Deque<T> | Util.Suspension<Cat<CmpdElement<T>>>);

    type SimpleSelector<T> = (lbl: CmpdLabels.SIMPLE, d: Deque<T>) =>
        (CmpdLabels.SIMPLE | Deque<T>);

    type CmpdSelector<T> =
        (lbl: CmpdLabels.COMPOUND, f: Deque<T>, m: Util.Suspension<Cat<CmpdElement<T>>>,
            r: Deque<T>) =>
                (CmpdLabels.COMPOUND | Deque<T> | Util.Suspension<Cat<CmpdElement<T>>>);

    const createSimple = <T>(D: Deque<T>) =>
        (<CmpdElement<T>>((C: SimpleSelector<T>) => C(CmpdLabels.SIMPLE, D)));

    const createCompound =
        <T>(f: Deque<T>, m: Util.Suspension<Cat<CmpdElement<T>>>, r: Deque<T>) =>
            (<CmpdElement<T>>((C: CmpdSelector<T>) => C(CmpdLabels.COMPOUND, f, m, r)));

    const cmpdLabel = (C: CmpdElement<any>) => <CmpdLabels>C(l => l);

    const isSimple = (C: CmpdElement<any>) => (cmpdLabel(C) === CmpdLabels.SIMPLE);

    const cmpdFront = <T>(C: CmpdElement<T>) => <Deque<T>>C((l, f) => f);

    const cmpdMiddle = <T>(C: CmpdElement<T>) =>
        (<Util.Suspension<Cat<CmpdElement<T>>>>C((l, f, m) => m));

    const cmpdRear = <T>(C: CmpdElement<T>) => <Deque<T>>C((l, f, m, r) => r);

    export const EmptyCat = createShallow(RealTimeDeque.EmptyDeque);

    export const isEmpty = (C: Cat<any>) =>
        (isShallow(C) && RealTimeDeque.isEmpty(front(C)));

    export const cons = <T>(x: T, C: Cat<T>): Cat<T> =>
        (isShallow(C) ?
            createShallow(RealTimeDeque.cons(x, front(C)))
        : createDeep(
            RealTimeDeque.cons(x, front(C)),
            cmpdElemA(C),
            middle(C),
            cmpdElemB(C),
            rear(C)));

    export const snoc = <T>(C: Cat<T>, x: T): Cat<T> =>
        (isShallow(C) ?
            createShallow(RealTimeDeque.snoc(front(C), x))
        : createDeep(
            front(C),
            cmpdElemA(C),
            middle(C),
            cmpdElemB(C),
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

    const share = <T>(f: Deque<T>, r: Deque<T>): [Deque<T>, Deque<T>, Deque<T>] => {
        let m = RealTimeDeque.cons(
            RealTimeDeque.last(f),
            RealTimeDeque.cons(
                RealTimeDeque.head(r),
                RealTimeDeque.EmptyDeque));
        return [RealTimeDeque.init(f), m, RealTimeDeque.tail(r)];
    };

    const dappendL = <T>(d1: Deque<T>, d2: Deque<T>): Deque<T> =>
        (RealTimeDeque.isEmpty(d1) ? d2
        : dappendL(
            RealTimeDeque.init(d1),
            RealTimeDeque.cons(RealTimeDeque.last(d1), d2)));

    const dappendR = <T>(d1: Deque<T>, d2: Deque<T>): Deque<T> =>
        (RealTimeDeque.isEmpty(d2) ? d1
        : dappendR(
            RealTimeDeque.snoc(d1, RealTimeDeque.head(d2)),
            RealTimeDeque.tail(d2)));

    export const concat = <T>(C1: Cat<T>, C2: Cat<T>): Cat<T> => {
        if (isShallow(C1) && isShallow(C2)) {
            if (RealTimeDeque.size(front(C1)) < 4)
                return createShallow(dappendL(front(C1), front(C2)));
            if (RealTimeDeque.size(front(C2)) < 4)
                return createShallow(dappendR(front(C1), front(C2)));
            let [f, m, r] = share(front(C1), front(C2));
            return createDeep(
                f, Util.$(() => EmptyCat), m, Util.$(() => EmptyCat), r);
        }
        if (isShallow(C1)) {
            if (RealTimeDeque.size(front(C1)) < 4)
                return createDeep(
                    dappendL(front(C1), front(C2)),
                    cmpdElemA(C2),
                    middle(C2),
                    cmpdElemB(C2),
                    rear(C2));
            return createDeep(
                front(C1),
                Util.$(() => cons(
                    createSimple(front(C2)),
                    Util.force(cmpdElemA(C2)))),
                middle(C2),
                cmpdElemB(C2),
                rear(C2));
        }
        if (isShallow(C2)) {
            if (RealTimeDeque.size(front(C2)) < 4)
                return createDeep(
                    front(C1),
                    cmpdElemA(C1),
                    middle(C1),
                    cmpdElemB(C1),
                    dappendR(rear(C1), front(C2)));
            return createDeep(
                front(C1),
                cmpdElemA(C1),
                middle(C1),
                Util.$(() => snoc(
                    Util.force(cmpdElemB(C1)),
                    createSimple(rear(C1)))),
                front(C2));
        }
        let [rprime, m, fprime] = share(rear(C1), front(C2));
        let aprime = Util.$(() => snoc(
            Util.force(cmpdElemA(C1)),
            createCompound(middle(C1), cmpdElemB(C2), rprime)));
        let bprime = Util.$(() => cons(
            createCompound(fprime, cmpdElemA(C2), middle(C2)),
            Util.force(cmpdElemB(C2))));
        return createDeep(front(C1), aprime, m, bprime, rear(C2));
    };

    const replaceHead = <T>(x: T, C: Cat<T>) =>
        (isShallow(C) ?
            createShallow(
                RealTimeDeque.cons(x, RealTimeDeque.tail(front(C))))
        : createDeep(
            RealTimeDeque.cons(x, RealTimeDeque.tail(front(C))),
            cmpdElemA(C),
            middle(C),
            cmpdElemB(C),
            rear(C)));

    const replaceLast = <T>(x: T, C: Cat<T>) =>
        (isShallow(C) ?
            createShallow(
                RealTimeDeque.snoc(RealTimeDeque.init(front(C)), x))
        : createDeep(
            front(C),
            cmpdElemA(C),
            middle(C),
            cmpdElemB(C),
            RealTimeDeque.snoc(RealTimeDeque.init(rear(C)), x)));

    export const tail = <T>(C: Cat<T>): Cat<T> => {
        if (isEmpty(C))
            Util.raise('EmptyCat');
        if (isShallow(C))
            return createShallow(RealTimeDeque.tail(front(C)));
        if (RealTimeDeque.size(front(C)) > 3)
            return createDeep(
                RealTimeDeque.tail(front(C)),
                cmpdElemA(C),
                middle(C),
                cmpdElemB(C),
                rear(C));
        if (!isEmpty(Util.force(cmpdElemA(C)))) {
            if (isSimple(head(Util.force(cmpdElemA(C))))) {
                let fprime = dappendL(
                    RealTimeDeque.tail(front(C)),
                    cmpdFront(head(Util.force(cmpdElemA(C)))));
                return createDeep(
                    fprime,
                    Util.$(() => tail(Util.force(cmpdElemA(C)))),
                    middle(C),
                    cmpdElemB(C),
                    rear(C));
            }
            let fprime = dappendL(
                RealTimeDeque.tail(front(C)),
                cmpdFront(head(Util.force(cmpdElemA(C)))));
            let aprime = Util.$(() => concat(
                Util.force(cmpdMiddle(head(Util.force(cmpdElemA(C))))),
                replaceHead(
                    createSimple(cmpdRear(head(Util.force(cmpdElemA(C))))),
                    Util.force(cmpdElemA(C)))));
            return createDeep(fprime, aprime, middle(C), cmpdElemB(C), rear(C));
        }
        if (!isEmpty(Util.force(cmpdElemB(C)))) {
            if (isSimple(head(Util.force(cmpdElemB(C))))) {
                let fprime = dappendL(
                    RealTimeDeque.tail(front(C)),
                    middle(C));
                return createDeep(
                    fprime,
                    Util.$(() => EmptyCat),
                    cmpdFront(head(Util.force(cmpdElemB(C)))),
                    Util.$(() => tail(Util.force(cmpdElemB(C)))),
                    rear(C));
            }
            let fprime = dappendL(
                RealTimeDeque.tail(front(C)),
                middle(C));
            let aprime = Util.$(() => cons(
                createSimple(cmpdFront(head(Util.force(cmpdElemB(C))))),
                Util.force(cmpdMiddle(head(Util.force(cmpdElemB(C)))))));
            return createDeep(
                fprime,
                aprime,
                cmpdRear(head(Util.force(cmpdElemB(C)))),
                Util.$(() => tail(Util.force(cmpdElemB(C)))),
                rear(C));
        }
        return concat(
            createShallow(dappendL(RealTimeDeque.tail(front(C)), middle(C))),
            createShallow(rear(C)));
    };

    export const init = <T>(C: Cat<T>): Cat<T> => {
        if (isEmpty(C))
            Util.raise('EmptyCat');
        if (isShallow(C))
            return createShallow(RealTimeDeque.init(front(C)));
        if (RealTimeDeque.size(rear(C)) > 3)
            return createDeep(
                front(C),
                cmpdElemA(C),
                middle(C),
                cmpdElemB(C),
                RealTimeDeque.init(rear(C)));
        if (!isEmpty(Util.force(cmpdElemB(C)))) {
            if (isSimple(last(Util.force(cmpdElemB(C))))) {
                let rprime = dappendR(
                    cmpdFront(last(Util.force(cmpdElemB(C)))),
                    RealTimeDeque.init(rear(C)));
                return createDeep(
                    front(C),
                    cmpdElemA(C),
                    middle(C),
                    Util.$(() => init(Util.force(cmpdElemB(C)))),
                    rprime);
            }
            let rprime = dappendR(
                cmpdRear(last(Util.force(cmpdElemB(C)))),
                RealTimeDeque.init(rear(C)));
            let bprime = Util.$(() => concat(
                replaceLast(
                    createSimple(cmpdFront(last(Util.force(cmpdElemB(C))))),
                    Util.force(cmpdElemB(C))),
                Util.force(cmpdMiddle(last(Util.force(cmpdElemB(C)))))));
            return createDeep(front(C), cmpdElemA(C), middle(C), bprime, rprime);
        }
        if (!isEmpty(Util.force(cmpdElemA(C)))) {
            if (isSimple(last(Util.force(cmpdElemA(C))))) {
                let rprime = dappendR(
                    middle(C),
                    RealTimeDeque.init(rear(C)));
                return createDeep(
                    front(C),
                    Util.$(() => init(Util.force(cmpdElemA(C)))),
                    cmpdFront(last(Util.force(cmpdElemA(C)))),
                    Util.$(() => EmptyCat),
                    rprime);
            }
            let rprime = dappendR(
                middle(C),
                RealTimeDeque.init(rear(C)));
            let bprime = Util.$(() => snoc(
                Util.force(cmpdMiddle(last(Util.force(cmpdElemA(C))))),
                createSimple(cmpdRear(last(Util.force(cmpdElemA(C)))))));
            return createDeep(
                front(C),
                Util.$(() => init(Util.force(cmpdElemA(C)))),
                cmpdRear(last(Util.force(cmpdElemA(C)))),
                bprime,
                rprime);
        }
        return concat(
            createShallow(front(C)),
            createShallow(dappendR(middle(C), RealTimeDeque.init(rear(C)))));
    };
}
