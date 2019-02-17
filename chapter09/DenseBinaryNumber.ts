/*

Dense binary number representation,
a linked list of a binary enumerable
digit.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace DenseBinaryNumber {
    enum Digit { ZERO, ONE };

    export type Binary = List.List<Digit>;

    export const Zero = <List.List<Digit>>List.EmptyList;

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
            List.cons(Digit.ONE, Zero)
        : (isDigitZero(List.head(b)) ?
            List.cons(Digit.ONE, List.tail(b))
        : List.cons(Digit.ZERO, inc(List.tail(b)))));

    export const dec = (b: Binary): Binary =>
        (isBinaryZero(b) ?
            Util.raise('OutOfBounds')
        : ((!isDigitZero(List.head(b))) && isBinaryZero(List.tail(b)) ?
            Zero
        : (!isDigitZero(List.head(b)) ?
            List.cons(Digit.ZERO, List.tail(b))
        : List.cons(Digit.ONE, dec(List.tail(b))))));

    // Book's implementation, more efficient than the natural number
    // implementation (O(log(N)) vs O(N))
    export const add = (x: Binary, y: Binary): Binary =>
        (isBinaryZero(x) ? y
        : (isBinaryZero(y) ? x
        : ((!isDigitZero(and(List.head(x), List.head(y)))) ?
            List.cons(
                Digit.ZERO,
                inc(add(List.tail(x), List.tail(y))))
        : List.cons(
            xor(List.head(x), List.head(y)),
            add(List.tail(x), List.tail(y))))));
}
