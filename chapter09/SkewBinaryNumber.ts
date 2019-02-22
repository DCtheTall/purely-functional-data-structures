/*

Implementation of a skew binary number, a sparse
representation of numbers as a list of integers with
weight w_i = pow(2, i + 1) - 1 instead of regular
sparse binary numbers where w_i = pow(2, i).

inc() and dec() both run in O(1) time.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SkewBinaryNumber {
    export type Binary = List.List<number>;

    export const Zero = <Binary>List.EmptyList;

    export const isZero = List.EmptyList;

    export const inc = (B: Binary): Binary =>
        (isZero(B) ?
            List.cons(1, Zero)
        : (isZero(List.tail(B)) ?
            List.cons(1, B)
        : (List.head(B) === List.head(List.tail(B)) ?
            List.cons(
                1 + List.head(B) + List.head(List.tail(B)),
                List.tail(List.tail(B)))
        : List.cons(1, B))));

    export const dec = (B: Binary): Binary =>
        (isZero(B) ?
            Util.raise('OutOfBounds')
        : (isZero(List.tail(B)) ?
            Zero
        : (List.head(B) === 1 ?
            List.tail(B)
        : List.cons(
            Math.floor(List.head(B) / 2),
            List.cons(
                Math.floor(List.head(B) / 2),
                List.tail(B))))));
}
