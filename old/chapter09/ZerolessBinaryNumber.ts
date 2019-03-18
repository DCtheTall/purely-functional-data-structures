/*

Binary number representation which uses a list
of digits, either 1 or 2, to represent a natural
number.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace ZerolessBinaryNumber {
    enum Digit { ONE, TWO };

    const isOne = (d: Digit) => (d === Digit.ONE);

    const isTwo = (d: Digit) => (d === Digit.TWO);

    export type Binary = List.List<Digit>;

    export const Zero = <Binary>List.EmptyList;

    export const isZero = List.isEmpty;

    export const inc = (b: Binary): Binary =>
        (isZero(b) ?
            List.cons(Digit.ONE, Zero)
        : (isOne(List.head(b)) ?
            List.cons(Digit.TWO, List.tail(b))
        : List.cons(Digit.ONE, inc(List.tail(b)))));

    export const dec = (b: Binary): Binary =>
        (isZero(b) ?
            Util.raise('OutOfBounds')
        : (isOne(List.head(b)) && isZero(List.tail(b)) ?
            Zero
        : (isTwo(List.head(b)) ?
            List.cons(Digit.ONE, List.tail(b))
        : List.cons(Digit.TWO, dec(List.tail(b))))));

    export const add = (x: Binary, y: Binary) =>
        (isZero(x) ? y
        : (isZero(y) ? x
        : (isOne(List.head(x)) && isOne(List.head(y)) ?
            List.cons(
                Digit.TWO,
                add(List.tail(x), List.tail(y)))
        : (isOne(List.head(x)) || isOne(List.head(y)) ?
            List.cons(
                Digit.TWO,
                inc(add(List.tail(x), List.tail(y))))
        : List.cons(
            Digit.TWO,
            inc(inc(add(List.tail(x), List.tail(y)))))))));
}
