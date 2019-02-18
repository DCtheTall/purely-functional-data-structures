/*

Lazy dense binary number representation uses
streams instead of lists to reduce the cost
of inc and dec to O(1) amortized cost.

*/

import { Stream } from '../chapter04/Stream';
import { Util } from '../util';

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
