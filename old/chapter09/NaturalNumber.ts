/*

Functional natural number representation.
It's like a linked list where nodes only contain
their next pointer. The number is thelength of
the list.

*/

import { Util } from '../util';

export namespace NaturalNumber {
    export type Natural = (f: Selector) => Natural;

    type Selector = (n: Natural) => Natural;

    export const Zero = <Natural>null;

    const isZero = (n: Natural) => (n === Zero);

    export const succ = (n: Natural) => <Natural>(f => f(n));

    export const pred = (n: Natural) => n(x => x);

    export const add = (x: Natural, y: Natural): Natural =>
        (isZero(x) ? y
        : add(pred(x), succ(y)));

    export const subtract = (x: Natural, y: Natural): Natural =>
        (isZero(y) ? x
        : (isZero(x) ? Util.raise('OutOfBounds')
        : subtract(pred(x), pred(y))));
}
