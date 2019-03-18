/*

Implementation of a binary random access list based
on skew binomial numbers. All normal list operations
are O(1), update() and lookup() are O(log(N)).

This can be used instead of a
regular list for HoodMelvilleQueues to allow operations
like insert() and update() in logarithmic time.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SkewBinaryRandomAccessList {
    enum NodeLabels { LEAF, NODE };

    type Node<T> = (f: NodeSelector<T> | LeafSelector<T>) => (NodeLabels | T | Node<T>);

    type NodeSelector<T> =
        (lbl: NodeLabels, val: T, lft: Node<T>, rt: Node<T>) =>
            (NodeLabels | T | Node<T>);

    type LeafSelector<T> = (lbl: NodeLabels, val: T) => (NodeLabels | T);

    const label = (n: Node<any>) => <NodeLabels>n((lbl, val) => lbl);

    const isLeaf = (n: Node<any>) => (label(n) === NodeLabels.LEAF);

    const valueof = <T>(n: Node<T>) => <T>n((lbl, val) => val);

    const left = <T>(n: Node<T>) => <Node<T>>n((lbl, val, lft, rt) => lft);

    const right = <T>(n: Node<T>) => <Node<T>>n((lbl, val, lft, rt) => rt);

    const createLeaf = <T>(x: T) =>
        (<Node<T>>((L: LeafSelector<T>) => L(NodeLabels.LEAF, x)));

    const createNode = <T>(x: T, lft: Node<T>, rt: Node<T>) =>
        (<Node<T>>((N: NodeSelector<T>) => N(NodeLabels.NODE, x, lft, rt)));

    type Element<T> = (f: ElementSelector<T>) => (number | Node<T>);

    type ElementSelector<T> = (w: number, n: Node<T>) => (number | Node<T>);

    const size = (E: Element<any>) => <number>E((w, n) => w);

    const tree = <T>(E: Element<T>) => <Node<T>>E((w, n) => n);

    const createElement = <T>(sz: number, tr: Node<T>) =>
        (<Element<T>>(E => E(sz, tr)));

    export type RList<T> = List.List<Element<T>>;

    export const EmptyRList = <RList<any>>List.EmptyList;

    export const isEmpty = List.isEmpty;

    export const cons = <T>(x: T, R: RList<T>): RList<T> =>
        (isEmpty(R) || isEmpty(List.tail(R)) ?
            List.cons(createElement(1, createLeaf(x)), R)
        : (size(List.head(R)) === size(List.head(List.tail(R))) ?
            List.cons(
                createElement(
                    size(List.head(R)) + size(List.head(List.tail(R))) + 1,
                    createNode(
                        x,
                        tree(List.head(R)),
                        tree(List.head(List.tail(R))))),
                List.tail(List.tail(R)))
        : List.cons(createElement(1, createLeaf(x)), R)));

    export const head = <T>(R: RList<T>): T =>
        (isEmpty(R) ? Util.raise('EmptyList')
        : valueof(tree(List.head(R))));

    export const tail = <T>(R: RList<T>): RList<T> =>
        (isEmpty(R) ? Util.raise('EmptyList')
        : (isLeaf(List.head(R)) ?
            List.tail(R)
        : List.cons(
            createElement(
                (size(List.head(R)) >> 1),
                left(tree(List.head(R)))),
            List.cons(
                createElement(
                    (size(List.head(R)) >> 1),
                    right(tree(List.head(R)))),
                List.tail(R)))));

    const lookupTree = <T>(w: number, i: number, node: Node<T>): T =>
        (isLeaf(node) && (i !== 0) ?
            Util.raise('Subscript')
        : (i === 0 ?
            valueof(node)
        : (i <= (w >> 1) ?
            lookupTree((w >> 1), i - 1, left(node))
        : lookupTree(
            w >> 1,
            i - 1 - (w >> 1),
            right(node)))));

    const updateTree = <T>(w: number, i: number, y: T, node: Node<T>): Node<T> =>
        (isLeaf(node) && (i !== 0) ?
            Util.raise('Subscript')
        : (isLeaf(node) && (i === 0) ?
            createLeaf(y)
        : (i === 0 ?
            createNode(y, left(node), right(node))
        : (i <= (w >> 1) ?
            createNode(
                valueof(node),
                updateTree(w >> 1, i - 1, y, left(node)),
                right(node))
        : createNode(
            valueof(node),
            left(node),
            updateTree((w >> 1), i - 1 - (w >> 1), y, right(node)))))));

    export const lookup = <T>(i: number, R: RList<T>): T =>
        (isEmpty(R) ?
            Util.raise('Subscript')
        : (size(List.head(R)) < i ?
            lookupTree(size(List.head(R)), i, tree(List.head(R)))
        : lookup(i - size(List.head(R)), List.tail(R))));

    export const update = <T>(i: number, y: T, R: RList<T>): RList<T> =>
        (isEmpty(R) ?
            Util.raise('Subscript')
        : (size(List.head(R)) < i ?
            List.cons(
                createElement(
                    size(List.head(R)),
                    updateTree(size(List.head(R)), i, y, tree(List.head(R)))),
                List.tail(R))
        : List.cons(
            List.head(R),
            update(i - size(List.head(R)), y, List.tail(R)))));
}
