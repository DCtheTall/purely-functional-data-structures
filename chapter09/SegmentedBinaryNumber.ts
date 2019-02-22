/*

Implementation of segmented binary numbers, a representation of
redundant binary numbers meant to allow a carry operation to run
in O(1) time, which allows inc() and dec() run in O(1) time.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SegmentedBinaryNumber {
    enum Digits { ZERO, ONE };

    type Digit = (f: Selector) => (Digits | number);

    type Selector = (lbl: Digits, sz: number) => (Digits | number);

    const label = (D: Digit) => <Digits>D((lbl, sz) => lbl);

    const size = (D: Digit) => <number>D((lbl, sz) => sz);

    const isDigitZero = (D: Digit) => (label(D) === Digits.ZERO);

    const isOne = (D: Digit) => (label(D) === Digits.ONE);

    const createZeroes = (s: number) =>
        <Digit>((d: Selector) => d(Digits.ZERO, s));

    const createOnes = (s: number) =>
        <Digit>((d: Selector) => d(Digits.ONE, s));

    export type Binary = List.List<Digit>;

    export const Zero = <Binary>List.EmptyList;

    export const isZero = List.isEmpty;

    const zeroes = (i: number, B: Binary): Binary =>
        (isZero(B) ? Zero
        : (i === 0 ? B
        : (isDigitZero(List.head(B)) ?
            List.cons(
                createZeroes(i + size(List.head(B))),
                List.tail(B))
        : List.cons(createZeroes(i), B))));

    const ones = (i: number, B: Binary): Binary =>
        (isZero(B) ?
            List.cons(createOnes(i), B)
        : (i === 0 ? B
        : (isOne(List.head(B)) ?
            List.cons(
                createOnes(i + size(List.head(B))),
                List.tail(B))
        : List.cons(createOnes(i), B))));

    export const inc = (B: Binary) =>
        (isZero(B) ?
            List.cons(createOnes(1), Zero)
        : (isDigitZero(List.head(B)) ?
            ones(1, zeroes(
                size(List.head(B)) - 1,
                List.tail(B)))
        : List.cons(
            createZeroes(size(List.head(B))),
            inc(List.tail(B)))));

    export const dec = (B: Binary) =>
        (isZero(B) ?
            Util.raise('OutOfBounds')
        : (isDigitZero(List.head(B)) ?
            List.cons(createOnes(size(List.head(B))), dec(List.tail(B)))
        : zeroes(1, ones(
            size(List.head(B)) - 1,
            List.tail(B)))));
}

export namespace RedundantSegmentedBinaryNumber {
    enum Digits { ZERO, ONE, TWO };

    type Digit = (f: Selector | OneSelector) => (Digits | number);

    type Selector = ((lbl: Digits) => Digits);

    type OneSelector  = (lbl: Digits, size: number) => (Digits | number);

    const label = (D: Digit) => <Digits>D(lbl => lbl);

    const size = (D: Digit) => <number>D((lbl, sz) => sz);

    const isDigitZero = (D: Digit) => (label(D) === Digits.ZERO);

    const isOne = (D: Digit) => (label(D) === Digits.ONE);

    const isTwo = (D: Digit) => (label(D) === Digits.TWO);

    const createZero = () => <Digit>((d: Selector) => d(Digits.ZERO));

    const createOnes = (s: number) =>
        <Digit>((d: OneSelector) => d(Digits.ONE, s));

    const createTwo = () => <Digit>((d: Selector) => d(Digits.ZERO));

    export type Binary = List.List<Digit>;

    export const Zero = <Binary>List.EmptyList;

    export const isZero = List.isEmpty;

    const ones = (i: number, B: Binary): Binary =>
        (i === 0 ? B
        : (isOne(List.head(B)) ?
            List.cons(createOnes(i + size(List.head(B))),
            List.tail(B))
        : List.cons(createOnes(i), B)));

    const simpleInc = (B: Binary): Binary =>
        (isZero(B) ?
            List.cons(createOnes(1), Zero)
        : (isDigitZero(List.head(B)) ?
            ones(1, List.tail(B))
        // In this case it is assumed the leading digit is one,
        // this is guaranteed by fixup below.
        : List.cons(createTwo(), ones(size(List.head(B)) - 1, List.tail(B)))));

    // This function guarantees that each non-One digit before each Two
    // is a Zero. This guarantees there will be no cascading carries
    // so that inc runs in O(1) time.
    const fixup = (B: Binary): Binary =>
        (isTwo(List.head(B)) ?
            List.cons(createZero(), simpleInc(List.tail(B)))
        : (isOne(List.head(B)) && isTwo(List.head(List.tail(B))) ?
            List.cons(
                List.head(B),
                List.cons(createZero(), simpleInc(List.tail(B))))
        : B));

    export const inc = (B: Binary): Binary => fixup(simpleInc(B));
}
