/*

A random access list which stores its
values in a list of complete binary
trees which only store data at the leaf
nodes. All operations run in O(log(N)) time
in the worst case.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace BinaryAccessList {
    enum TreeTypes {LEAF, NODE};

    type Leaf<T> = (f: LeafSelector<T>) => (TreeTypes.LEAF | T);

    const valueof = <T>(L: Leaf<T>) => <T>L((t, v) => v);

    const createLeaf = <T>(x: T) => <Leaf<T>>(f => f(TreeTypes.LEAF, x));

    type LeafSelector<T> = (type: TreeTypes.LEAF, el: T) => (TreeTypes.LEAF | T);

    type Node<T> = (f: NodeSelector<T>) => (TreeTypes.NODE | number | Node<T>);

    type NodeSelector<T> = (type: TreeTypes.NODE, size: number, left: Tree<T>, right: Tree<T>) =>
        (TreeTypes.NODE | number | Node<T>);

    type Tree<T> = Leaf<T> | Node<T>;

    const createNode = <T>(size: number, left: Tree<T>, right: Tree<T>) =>
        (<Node<T>>(n => n(TreeTypes.NODE, size, left, right)));

    const type = (T: Tree<any>) => <TreeTypes>(<any>T)(t => t);

    const isLeaf = (T: Tree<any>) => (type(T) === TreeTypes.LEAF);

    const left = <T>(t: Node<T>) => <Tree<T>>(<any>t)((t, s, l, r) => l);

    const right = <T>(t: Node<T>) => <Tree<T>>(<any>t)((t, s, l, r) => r);

    const size = (T: Tree<any>): number =>
        (isLeaf(T) ? 1
        : <number>(<Node<any>>T)((t, s, l, r) => s));

    enum Digits {ZERO, ONE};

    type Digit<T> =
        ((f: (b: Digits.ZERO) => Digits.ZERO) => Digits.ZERO) |
        ((f: (b: Digits.ONE, t: Tree<T>) => (Digits.ONE | Tree<T>)) => (Digits.ONE | Tree<T>));

    const createZero = () => <Digit<any>>(D => D(Digits.ZERO));

    const createOne = <T>(t: Tree<T>) => <Digit<T>>(D => D(Digits.ONE, t));

    const digit = (d: Digit<any>) => <Digits>(<any>d)(b => b);

    const tree = <T>(d: Digit<T>) => <Tree<T>>(<any>d)((b, t) => t);

    const isZero = (d: Digit<any>) => (digit(d) === Digits.ZERO);

    export type RList<T> = List.List<Digit<T>>;

    export const EmptyRList = <List.List<Digit<any>>>List.EmptyList;

    export const isEmpty = List.isEmpty;

    const link = <T>(t1: Tree<T>, t2: Tree<T>): Node<T> =>
        createNode(size(t1) + size(t2), t1, t2);

    const consTree = <T>(t: Tree<T>, R: RList<T>): RList<T> =>
        (isEmpty(R) ?
            List.cons(createOne(t), EmptyRList)
        : (isZero(List.head(R)) ?
            List.cons(createOne(t), List.tail(R))
        : List.cons(
            createZero(),
            consTree(
                (<Tree<T>>link(t, tree(List.head(R)))),
                List.tail(R)))));

    type TreeRListTuple<T> =
        (f: (t: Tree<T>, R: RList<T>) => (Tree<T> | RList<T>)) => (Tree<T> | RList<T>);

    const first = <T>(t: TreeRListTuple<T>) => <Tree<T>>t((tr, rl) => tr);

    const second = <T>(t: TreeRListTuple<T>) => <RList<T>>t((tr, rl) => rl);

    const createTuple = <T>(t: Tree<T>, R: RList<T>) =>
        (<TreeRListTuple<T>>(f => f(t, R)));

    const unconsTree = <T>(R: RList<T>): TreeRListTuple<T> => {
        if (isEmpty(R))
            Util.raise('Empty');
        if ((!isZero(List.head(R))) && isEmpty(List.tail(R)))
            return createTuple(tree(List.head(R)), EmptyRList);
        if (!isZero(List.head(R)))
            return createTuple(
                tree(List.head(R)),
                List.cons(createZero(), List.tail(R)));
        let val = unconsTree(List.tail(R));
        return createTuple(
            left(<Node<T>>first(val)),
            List.cons(
                createOne(right(<Node<T>>first(val))),
                second(val)));
    };

    export const cons = <T>(x: T, R: RList<T>): RList<T> =>
        consTree(createLeaf(x), R);

    export const head = <T>(R: RList<T>): T =>
        valueof(<Leaf<T>>first(unconsTree(R)));

    export const tail = <T>(R: RList<T>): RList<T> =>
        second(unconsTree(R));

    const lookupTree = <T>(i: number, t: Tree<T>): T =>
        (i === 0 && isLeaf(t) ?
            valueof(<Leaf<T>>t)
        : (i < Math.floor(size(t) / 2) ?
            lookupTree(i, left(<Node<T>>t))
        : lookupTree(
            i - Math.floor(size(t) / 2),
            right(<Node<T>>t))));

    export const lookup = <T>(i: number, R: RList<T>): T =>
        (isEmpty(R) ?
            Util.raise('Subscript')
        : (isZero(List.head(R)) ?
            lookup(i, List.tail(R))
        : (i < size(tree(List.head(R))) ?
            lookupTree(i, tree(List.head(R)))
        : lookup(i - size(tree(List.head(R))), List.tail(R)))));

    const updateTree = <T>(i: number, y: T, t: Tree<T>) =>
        (i === 0 && isLeaf(t) ?
            createLeaf(y)
        : (isLeaf(t) ?
            Util.raise('Subscript')
        : (i < Math.floor(size(t) / 2 ) ?
            createNode(
                size(t),
                updateTree(i, y, left(<Node<T>>t)),
                right(<Node<T>>t))
        : createNode(
            size(t),
            left(<Node<T>>t),
            updateTree(i - Math.floor(size(t) / 2), y, right(<Node<T>>t))))));

    export const update = <T>(i: number, y: T, R: RList<T>) =>
        (isEmpty(R) ?
            Util.raise('Subscript')
        : (isZero(List.head(R)) ?
            List.cons(createZero(), update(i, y, List.tail(R)))
        : (i < size(tree(List.head(R))) ?
            List.cons(
                createOne(updateTree(i, y, tree(List.head(R)))),
                List.tail(R))
        : List.cons(
            List.head(R),
            update(i - size(tree(List.head(R))), y, List.tail(R))))));
}
