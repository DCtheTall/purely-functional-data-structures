/*

Implementation of segmented binary numbers, a representation of
redundant binary numbers meant to allow a carry operation to run
in O(1) time.

*/

import { List } from "../chapter02/List";

export namespace SegmentedBinaryNumber {
    enum Digits { ZERO, ONE, TWO };

    type Digit = (f: Selector) => (Digits | number);

    type Selector = ((d: Digits) => Digits) |
        ((d: Digits, size: number) => (Digits | number));

    const digit = (D: Digit) => <Digits>D(d => d);

    const size = (D: Digit) => <number>D((d, s) => s);

    const isOne = (D: Digit) => (digit(D) === Digits.ONE);

    const createOne = (s: number): Digit =>
        (d => d(Digits.ONE, s));

    export type Binary = List.List<Digit>;

    export const Zero = <Binary>List.EmptyList;

    export const isZero = List.isEmpty;

    const ones = (i: number, ds: Binary): Binary =>
        (i === 0 ? ds
        : (isOne(List.head(ds)) ?
            List.cons(createOne(i + size(List.head(ds))),
            List.tail(ds))
        : List.cons(createOne(i), ds)));
}
