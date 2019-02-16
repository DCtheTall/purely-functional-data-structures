/*

Sparse binary number representation.

*/

import { List } from "../chapter02/List";
import { Util } from "../util";

export namespace SpareBinaryNumber {
    export type Binary = List.List<number>;

    export const Zero = List.EmptyList;

    export const isZero = List.isEmpty;

    // x is always the least significant bit in the number
    const carry = (x: number, b: Binary): Binary =>
        (isZero(b) ?
            List.cons(x, Zero)
        : (x < List.head(b) ?
            List.cons(x, b)
        : carry(x << 1, List.tail(b))));

    // Unsets the LSB, setting all bits to the left of it
    const borrow = (x: number, b: Binary): Binary =>
        (isZero(b) ?
            Util.raise('OutOfBounds')
        : (x === List.head(b) ?
            List.tail(b)
        : List.cons(x, borrow(x << 1, b))));

    export const inc = (b: Binary): Binary => carry(1, b);

    export const dec = (b: Binary): Binary => borrow(1, b);

    export const add = (x: Binary, y: Binary): Binary =>
        (isZero(x) ? y
        : (isZero(y) ? x
        : (List.head(x) < List.head(y) ?
            List.cons(List.head(x), add(List.tail(x), y))
        : (List.head(y) < List.head(x) ?
            List.cons(List.head(y), add(x, List.tail(y)))
        : carry(
            List.head(x) << 1,
            add(List.tail(x), List.tail(y)))))));
}
