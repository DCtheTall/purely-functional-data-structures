/*

Lazy dense binary number representations that
use streams instead of lists to reduce the cost
of inc and dec to O(1) amortized cost.

*/

import { Stream } from '../chapter04/Stream';
import { Util } from '../util';

// This representation achieves O(1) amortized cost for inc
// and dec seperately, but are O(log(N)) time when used
// together.
export namespace LazyBinaryNumber {
    enum Digit { ZERO, ONE };

    export type Binary = Stream.Stream<Digit>;

    export const Zero = <Stream.Stream<Digit>>Stream.EmptyStream;

    const isDigitZero = (d: Digit) => (d === Digit.ZERO);

    const xor = (a: Digit, b: Digit): Digit =>
        (isDigitZero(a) ? b
        : (isDigitZero(b) ? a
        : Digit.ZERO));

    const and = (a: Digit, b: Digit): Digit =>
        (isDigitZero(a) ?a
        : b);

    const isBinaryZero = (b: Binary) => (b === Zero);

    export const inc = (b: Binary): Binary =>
        (isBinaryZero(b) ?
            Stream.cons(Digit.ONE, Zero)
        : (isDigitZero(Stream.head(b)) ?
            Stream.cons(Digit.ONE, Stream.tail(b))
        : Stream.cons(Digit.ZERO, inc(Stream.tail(b)))));

    export const dec = (b: Binary): Binary =>
        (isBinaryZero(b) ?
            Util.raise('OutOfBounds')
        : ((!isDigitZero(Stream.head(b))) && isBinaryZero(Stream.tail(b)) ?
            Zero
        : (!isDigitZero(Stream.head(b)) ?
            Stream.cons(Digit.ZERO, Stream.tail(b))
        : Stream.cons(Digit.ONE, dec(Stream.tail(b))))));

    export const add = (x: Binary, y: Binary): Binary =>
        (isBinaryZero(x) ? y
        : (isBinaryZero(y) ? x
        : ((!isDigitZero(and(Stream.head(x), Stream.head(y)))) ?
            Stream.cons(
                Digit.ZERO,
                inc(add(Stream.tail(x), Stream.tail(y))))
        : Stream.cons(
            xor(Stream.head(x), Stream.head(y)),
            add(Stream.tail(x), Stream.tail(y))))));
}

export namespace RedundantBinaryNumber {
    enum Digit { ZERO, ONE, TWO };

    export type Binary = Stream.Stream<Digit>;

    export const Zero = <Stream.Stream<Digit>>Stream.EmptyStream;

    const isDigitZero = (d: Digit) => (d === Digit.ZERO);

    const isDigitOne = (d: Digit) => (d === Digit.ONE);

    const isDigitTwo = (d: Digit) => (d === Digit.TWO);

    const isBinaryZero = (b: Binary) => (b === Zero);

    export const inc = (b: Binary): Binary =>
        (isBinaryZero(b) ?
            Stream.cons(Digit.ONE, b)
        : (isDigitZero(Stream.head(b)) ?
            Stream.cons(Digit.ONE, Stream.tail(b))
        : (isDigitOne(Stream.head(b)) ?
            Stream.cons(Digit.TWO, Stream.tail(b))
        : Stream.cons(Digit.ZERO, inc(Stream.tail(b))))));

    export const dec = (b: Binary): Binary =>
        (isBinaryZero(b) ?
            Util.raise('OutOfBounds')
        : (isDigitTwo(Stream.head(b)) ?
            Stream.cons(Digit.ONE, Stream.tail(b))
        : (isDigitOne(Stream.head(b)) ?
            Stream.cons(Digit.ZERO, Stream.tail(b))
        : Stream.cons(Digit.TWO, dec(Stream.tail(b))))));
}
