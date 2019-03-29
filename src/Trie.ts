/*

Purely Functional Data Structures
=================================
Trie
----

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

import {
  List,
  arrayToList,
  isEmpty as isEmptyList,
} from './List';
import {
  FiniteMap,
  EmptyMap,
  isEmpty as isEmptyMap,
  lookup as lookupMap,
  bind as bindMap,
} from './FiniteMap';
import { raise } from './util';

type Char = number;

type Str = List<Char>;

const stringToStr = (s: string): Str =>
  arrayToList(s.split('').map(c => c.charCodeAt(0)));

class None {
  constructor() {
    Object.freeze(this);
  }
}

class Some<T> {
  constructor(
    public readonly value: T,
  ) {
    Object.freeze(this);
  }
}

type TrieElement<T> = None | Some<T>;

export class Trie<T> {
  constructor(
    public readonly element: TrieElement<T>,
    public readonly children: FiniteMap<Char, Trie<T>>,
  ) {
    Object.freeze(this);
  }
}

export const EmptyTrie = new Trie(new None(), EmptyMap);

export const isEmpty = (T: Trie<any>): boolean =>
  (T.element instanceof None && isEmptyMap(T.children));

const lookupStr = <T>(s: Str, t: Trie<T>): T =>
  (isEmptyList(s) && t.element instanceof None ?
    raise('NotFound')
  : (isEmptyList(s) ?
    (<Some<T>>t.element).value
  : lookupStr(
    s.tail,
    lookupMap(t.children, s.head))));

export const lookup = <T>(s: string, t: Trie<T>): T =>
  lookupStr(stringToStr(s), t);

const bindStr = <T>(s: Str, x: T, t: Trie<T>): Trie<T> => {
  if (isEmptyList(s))
    new Trie(new Some(x), t.children);
  let tprime: Trie<T>;
  try {
    tprime = lookupMap(t.children, s.head);
  } catch (e) {
    tprime = <Trie<T>>EmptyTrie;
  }
  let tpprime = bindStr(s.tail, x, tprime);
  return new Trie(
    t.element,
    bindMap(s.head, tpprime, t.children));
};

export const bind = <T>(s: string, x: T, t: Trie<T>) =>
  bindStr(stringToStr(s), x, t);
