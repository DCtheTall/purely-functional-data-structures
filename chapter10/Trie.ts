/*

Implementation of a trie data structure using
the FiniteMap defined in chapter 2, in this program
a "string" is represented as a List of characters.

*/

import { List } from '../chapter02/List';
import { FiniteMap } from '../chapter02/FiniteMap';
import { Util } from '../util';

export namespace Trie {
    type Char = number; // numbers in JS are the closest thing to a char type.

    type Str = List.List<Char>;

    enum Label { NONE, SOME };

    type Elem<T> = (f: NoneSelector | SomeSelector<T>) => (Label | T);

    type NoneSelector = (lbl: Label.NONE) => Label.NONE;

    type SomeSelector<T> = (lbl: Label.SOME, x: T) => (Label | T);

    const createNone = <T>() => <Elem<T>>((E: NoneSelector) => E(Label.NONE));

    const createSome = <T>(x: T) =>
        (<Elem<T>>((E: SomeSelector<T>) => E(Label.SOME, x)));

    const label = <T>(E: Elem<T>) => <Label>E(l => l);

    const valueof = <T>(E: Elem<T>) => <T>E((l, e) => e);

    const isNone = (E: Elem<any>) => (label(E) === Label.NONE);

    export type Trie<T> = (f: TrieSelector<T>) => (Elem<T> | FiniteMap.Map<Char, Trie<T>>);

    type TrieSelector<T> = (el: Elem<T>, ch: FiniteMap.Map<Char, Trie<T>>) =>
        (Elem<T> | FiniteMap.Map<Char, Trie<T>>);

    const createTrie = <T>(el: Elem<T>, ch: FiniteMap.Map<Char, Trie<T>>) =>
        (<Trie<T>>(F => F(el, ch)));

    export const EmptyTrie = createTrie(createNone(), FiniteMap.EmptyMap);

    const element = <T>(Tr: Trie<T>) => <Elem<T>>Tr((e, ch) => e);

    const children = <T>(Tr: Trie<T>) => <FiniteMap.Map<Char, Trie<T>>>Tr((e, ch) => ch);

    export const isEmpty = (Tr: Trie<any>) =>
        (isNone(element(Tr)) && FiniteMap.isEmpty(children(Tr)));

    export const lookup = <T>(str: Str, Tr: Trie<T>): T =>
        (isNone(element(Tr)) ?
            Util.raise('NotFound')
        : (List.isEmpty(str) ?
            valueof(element(Tr))
        : lookup(
            List.tail(str),
            FiniteMap.lookup(
                children(Tr),
                List.head(str)))));

    export const bind = <T>(str: Str, x: T, Tr: Trie<T>): Trie<T> => {
        if (List.isEmpty(str))
            return createTrie(createSome(x), children(Tr));
        let t: Trie<T>;
        try {
            t = FiniteMap.lookup(children(Tr), List.head(str));
        } catch (_) {
            t = <Trie<T>>EmptyTrie;
        }
        let tprime = bind(List.tail(str), x, t);
        return createTrie(
            element(Tr),
            FiniteMap.bind(List.head(str), tprime, children(Tr)));
    };
}
