/*

Implicit queue data structure.

*/

import { Util } from "../util";

export namespace ImplicitQueue {
    type Tuple<T> = (f: TupleSelector<T>) => T;

    type TupleSelector<T> = (f: T, s: T) => T;

    const first = <T>(tup: Tuple<T>) => tup((f, s) => f);

    const second = <T>(tup: Tuple<T>) => tup((f, s) => s);

    enum Digits { ZERO, ONE, TWO };

    type Digit<T> = (f: (ZeroSelector | OneSelector<T> | TwoSelector<T>)) =>
        (Digits | T | Tuple<T>);

    type ZeroSelector = (lbl: Digits.ZERO) => Digits.ZERO;

    type OneSelector<T> = (lbl: Digits.ONE, val: T) => (Digits.ONE | T);

    type TwoSelector<T> = (lbl: Digits.TWO, val: Tuple<T>) =>
        (Digits.TWO | Tuple<T>);

    const digitLabel = (D: Digit<any>) => <Digits>D(l => l);

    const isZero = (D: Digit<any>) => (digitLabel(D) === Digits.ZERO);

    const digitValue = <T>(D: Digit<T>) => <T | Tuple<T>>D((l, v) => v);

    const createZero = () => <Digit<any>>((D: ZeroSelector) => D(Digits.ZERO));

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

    const queue = <T>(Q: Queue<T>) => <Util.Suspension<Queue<Tuple<T>>>>Q((l, d, q) => q);

    const rear = <T>(Q: Queue<T>) => <Digit<T>>Q((l, d, q, r) => r);

    const createShallow = <T>(D: Digit<T>) =>
        (<Queue<T>>((Q: ShallowSelector<T>) => Q(Labels.SHALLOW, D)));

    export const EmptyQueue = createShallow(createZero());

    export const isEmpty = (Q: Queue<any>) => (isShallow(Q) && isZero(front(Q)));
}
