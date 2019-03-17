/*

Implicit queue data structure.

*/

import { Util } from "../util";

export namespace ImplicitQueue {
    type Tuple<T> = (f: TupleSelector<T>) => T;

    type TupleSelector<T> = (f: T, s: T) => T;

    const first = <T>(tup: Tuple<T>) => tup((f, s) => f);

    const second = <T>(tup: Tuple<T>) => tup((f, s) => s);

    const createTuple = <T>(f: T, s: T) => <Tuple<T>>(tup => tup(f, s));

    enum Digits { ZERO, ONE, TWO };

    type Digit<T> = (f: (ZeroSelector | OneSelector<T> | TwoSelector<T>)) =>
        (Digits | T | Tuple<T>);

    type ZeroSelector = (lbl: Digits.ZERO) => Digits.ZERO;

    type OneSelector<T> = (lbl: Digits.ONE, val: T) => (Digits.ONE | T);

    type TwoSelector<T> = (lbl: Digits.TWO, val: Tuple<T>) =>
        (Digits.TWO | Tuple<T>);

    const digitLabel = (D: Digit<any>) => <Digits>D(l => l);

    const isZero = (D: Digit<any>) => (digitLabel(D) === Digits.ZERO);

    const isOne = (D: Digit<any>) => (digitLabel(D) === Digits.ONE);

    const isTwo = (D: Digit<any>) => (digitLabel(D) === Digits.TWO);

    const digitValue = <T>(D: Digit<T>) => <T | Tuple<T>>D((l, v) => v);

    const createZero = () => <Digit<any>>((D: ZeroSelector) => D(Digits.ZERO));

    const createOne = <T>(x: T) =>
        (<Digit<T>>((D: OneSelector<T>) => D(Digits.ONE, x)));

    const createTwo = <T>(f: T, s: T) =>
        (<Digit<T>>((D: TwoSelector<T>) => D(Digits.TWO, createTuple(f, s))));

    enum Labels { SHALLOW, DEEP };

    export type Queue<T> = (f: (ShallowSelector<T> | DeepSelector<T>)) =>
        (Labels | Digit<T> | Util.Suspension<Queue<Tuple<T>>>);

    type ShallowSelector<T> = (lbl: Labels.SHALLOW, d: Digit<T>) =>
        (Labels.SHALLOW | Digit<T>);

    type DeepSelector<T> =
        (lbl: Labels.DEEP, f: Digit<T>, qs: Util.Suspension<Queue<Tuple<T>>>, r: Digit<T>) =>
            (Labels.DEEP | Digit<T> | Util.Suspension<Queue<Tuple<T>>>);

    const label = (Q: Queue<any>) => <Labels>Q(l => l);

    const isShallow = (Q: Queue<any>) => (label(Q) === Labels.SHALLOW);

    const front = <T>(Q: Queue<T>) => <Digit<T>>Q((l, d) => d);

    const middle = <T>(Q: Queue<T>) =>
        (<Util.Suspension<Queue<Tuple<T>>>>Q((l, d, qs, r) => qs));

    const rear = <T>(Q: Queue<T>) => <Digit<T>>Q((l, d, qs, r) => r);

    const createShallow = <T>(D: Digit<T>) =>
        (<Queue<T>>((Q: ShallowSelector<T>) => Q(Labels.SHALLOW, D)));

    const createDeep =
        <T>(f: Digit<T>, qs: Util.Suspension<Queue<Tuple<T>>>, r: Digit<T>) =>
            (<Queue<T>>((Q: DeepSelector<T>) => Q(Labels.DEEP, f, qs, r)));

    export const EmptyQueue = createShallow(createZero());

    export const isEmpty = (Q: Queue<any>) => (isShallow(Q) && isZero(front(Q)));

    export const snoc = <T>(Q: Queue<T>, y: T): Queue<T> =>
        (isEmpty(Q) ?
            createShallow(createOne(y))
        : (isShallow(Q) ?
            createDeep(
                createTwo(digitValue(front(Q)), y),
                Util.lazy(() => EmptyQueue),
                createZero())
        : (isZero(rear(Q)) ?
            createDeep(
                front(Q),
                middle(Q),
                createOne(y))
        : createDeep(
            front(Q),
            Util.lazy(() => snoc(
                Util.force(middle(Q)),
                createTuple(digitValue(rear(Q)), y))),
            createZero()))));

    export const head = <T>(Q: Queue<T>): T =>
        (isEmpty(Q) ?
            Util.raise('EmptyQueue')
        : (isOne(front(Q)) ?
            <T>digitValue(front(Q))
        : first(<Tuple<T>>digitValue(front(Q)))));

    export const tail = <T>(Q: Queue<T>): Queue<T> => {
        if (isEmpty(Q))
            Util.raise('EmptyQueue');
        if (isShallow(Q))
            return EmptyQueue;
        if (isTwo(front(Q)))
            return createDeep(
                createOne(second(<Tuple<T>>digitValue(front(Q)))),
                middle(Q),
                rear(Q));
        if (isEmpty(Util.force(middle(Q))))
            return createShallow(rear(Q));
        let yz = head(Util.force(middle(Q)));
        return createDeep(
            createTwo(first(yz), second(yz)),
            Util.lazy(() => tail(Util.force(middle(Q)))),
            rear(Q));
    };
}
