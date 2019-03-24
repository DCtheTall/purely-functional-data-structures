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

    type Elem = (f: NoneSelector | SomeSelector) => (Label | Char);

    type NoneSelector = (lbl: Label.NONE) => Label.NONE;

    type SomeSelector = (lbl: Label.SOME, x: Char) => (Label | Char);

    const createNone = () => <Elem>((E: NoneSelector) => E(Label.NONE));

    const createSome = (x: Char) =>
        (<Elem>((E: SomeSelector) => E(Label.SOME, x)));

    const label = (E: Elem) => <Label>E(l => l);

    const valueof = (E: Elem) => <Char>E((l, e) => e);

    const isNone = (E: Elem) => (label(E) === Label.NONE);

    export type Trie = (f: TrieSelector) => (Elem | FiniteMap.Map<Char, Trie>);

    type TrieSelector = (el: Elem, ch: FiniteMap.Map<Char, Trie>) =>
        (Elem | FiniteMap.Map<Char, Trie>);

    const createTrie = (el: Elem, ch: FiniteMap.Map<Char, Trie>) =>
        (<Trie>(F => F(el, ch)));

    export const EmptyTrie = createTrie(createNone(), FiniteMap.EmptyMap);

    const element = (Tr: Trie) => <Elem>Tr((e, ch) => e);

    const children = (Tr: Trie) => <FiniteMap.Map<Char, Trie>>Tr((e, ch) => ch);

    export const isEmpty = (Tr: Trie) =>
        (isNone(element(Tr)) && FiniteMap.isEmpty(children(Tr)));

    export const lookup = (str: Str, Tr: Trie): Elem =>
        (isNone(element(Tr)) ?
            Util.raise('NotFound')
        : (List.isEmpty(str) ?
            element(Tr)
        : lookup(
            List.tail(str),
            FiniteMap.lookup(
                children(Tr),
                List.head(str)))));

    export const bind = (str: Str, x: Char, Tr: Trie): Trie => {
        if (List.isEmpty(str))
            return createTrie(createSome(x), children(Tr));
        let t: Trie;
        try {
            t = FiniteMap.lookup(children(Tr), List.head(str));
        } catch (_) {
            t = <Trie>EmptyTrie;
        }
        let tprime = bind(List.tail(str), x, t);
        return createTrie(
            element(Tr),
            FiniteMap.bind(List.head(str), tprime, children(Tr)));
    };
}
