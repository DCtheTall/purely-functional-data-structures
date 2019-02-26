/*

Alternative implementation of binary random
access lists using structural decomposition.

*/

import { Util } from '../util';

export namespace AltBinaryRandomAccessList {
    type Tuple<S, T> = (f: TupleSelector<S, T>) => (S | T);

    type TupleSelector<S, T> = (x: S, y: T) => (S | T);;

    const first = <S, T>(tup: Tuple<S, T>) => <S>tup((x, y) => x);

    const second = <S, T>(tup: Tuple<S, T>) => <T>tup((x, y) => y);

    const createTuple = <S, T>(x: S, y: T) =>
        (<Tuple<S, T>>(tup => tup(x, y)));

    enum Digits { ZERO, ONE };

    export type RList<T> = (f: ZeroSelector<T> | OneSelector<T>) =>
        (Digits | T | RListTuple<T>);

    type ZeroSelector<T> = (d: Digits.ZERO, rl: RList<Tuple<T,T>>) =>
        (Digits.ZERO | RListTuple<T>);

    type OneSelector<T> = (d: Digits.ONE, val: T, rl: RList<Tuple<T,T>>) =>
        (Digits.ONE | T | RListTuple<T>);

    type RListTuple<T> = RList<Tuple<T, T>>;

    const createZero = <T>(rl: RList<Tuple<T,T>>) =>
        (<RList<T>>((R: ZeroSelector<T>) => R(Digits.ZERO, rl)));

    const createOne = <T>(val: T, rl: RList<Tuple<T,T>>) =>
        (<RList<T>>((R: OneSelector<T>) => R(Digits.ONE, val, rl)));

    const digit = (R: RList<any>) => <Digits>R(d => d);

    const isDigit = (d: Digits) => (rl: RList<any>) => (digit(rl) === d);

    const isZero = isDigit(Digits.ZERO);

    const isOne = isDigit(Digits.ONE);

    const rlist = <T>(rl: RList<T>): RListTuple<T> =>
        (isZero(rl) ?
            (<RListTuple<T>>rl((d, rl) => rl))
        : (<RListTuple<T>>rl((d, v, rl) => rl)));

    const valueof = <T>(R: RList<T>): T => <T>R((d, v, rl) => v);

    export const EmptyRList = <RList<any>>null;

    export const isEmpty = (R: RList<any>) => (R === EmptyRList);

    export const cons = <T>(x: T, R: RList<T>): RList<T> =>
        (isEmpty(R) ?
            createOne(x, EmptyRList)
        : (isZero(R) ?
            createOne(x, rlist(R))
        : createZero(
            cons(createTuple(x, valueof(R)), rlist(R)))));

    const uncons = <T>(R: RList<T>): Tuple<T, RList<T>> => {
        if (isEmpty(R))
            Util.raise('EmptyRList');
        if (isOne(R) && isEmpty(rlist(R)))
            return createTuple(valueof(R), EmptyRList);
        if (isOne(R))
            return createTuple(valueof(R), createZero(rlist(R)));
        let rec = uncons(rlist(R));
        return createTuple(
            first(first(rec)),
            createOne(second(first(rec)), second(rec)));
    };

    export const head = <T>(R: RList<T>): T => first(uncons(R));

    export const tail = <T>(R: RList<T>): RList<T> => second(uncons(R));

    export const lookup = <T>(i: number, R: RList<T>): T => {
        if (isEmpty(R))
            Util.raise('EmptyRList');
        if (i === 0 && isOne(R))
            return valueof(R)
        if (isOne(R))
            return lookup(i - 1, createZero(rlist(R)));
        let rec = lookup((i >> 1), rlist(R));
        if ((i & 1) === 0)
            return first(rec);
        return second(rec);
    };

    const fupdate = <T>(f: (x: T) => T, i: number, R: RList<T>): RList<T> => {
        if (isEmpty(R))
            Util.raise('EmptyRList');
        if (i === 0 && isOne(R))
            return createOne(f(valueof(R)), rlist(R));
        if (isOne(R))
            return cons(
                valueof(R),
                fupdate(f, i - 1, createZero(rlist(R))));
        let func = (t: Tuple<T, T>): Tuple<T, T> =>
            (((i & 1) === 0) ? createTuple(f(first(t)), second(t))
            : createTuple(first(t), f(second(t))));
        return createZero(fupdate(func, (i >> 1), rlist(R)));
    };

    export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
        fupdate((_: T) => y, i, R);
}
