/*

Binary random access list which uses complete
binary trees which only store data at the leaves.
This implementation uses the sparse representation
of binary numbers, and is a solution to exercise
9.3.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SparseBinaryRandomAccessList {
    enum TreeTypes { LEAF, NODE };

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

    export type RList<T> = List.List<Tree<T>>;

    export const EmptyRList = <List.List<Tree<any>>>List.EmptyList;

    export const isEmpty = List.isEmpty;

    const link = <T>(t1: Tree<T>, t2: Tree<T>): Node<T> =>
        createNode(size(t1) + size(t2), t1, t2);

    const consTree = <T>(t: Tree<T>, R: RList<T>): RList<T> =>
        (isEmpty(R) ?
            List.cons(t, EmptyRList)
        : (size(t) < size(List.head(R)) ?
            List.cons(t, R)
        : consTree(
            (<Tree<T>>link(t, List.head(R))),
            List.tail(R))));

    type TreeRListTuple<T> =
        (f: (t: Tree<T>, R: RList<T>) => (Tree<T> | RList<T>)) => (Tree<T> | RList<T>);

    const first = <T>(t: TreeRListTuple<T>) => <Tree<T>>t((tr, rl) => tr);

    const second = <T>(t: TreeRListTuple<T>) => <RList<T>>t((tr, rl) => rl);

    const createTuple = <T>(t: Tree<T>, R: RList<T>) =>
        (<TreeRListTuple<T>>(f => f(t, R)));

    const unconsTree = <T>(R: RList<T>): TreeRListTuple<T> => {
        if (isEmpty(R))
            Util.raise('Empty');
        if (size(List.head(R)) === 1)
            return createTuple(List.head(R), List.tail(R));
        let val = unconsTree(List.tail(R));
        return createTuple(
            left(<Node<T>>first(val)),
            List.cons(
                right(<Node<T>>first(val)),
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
        : (i < size(List.head(R)) ?
            lookupTree(i, List.head(R))
        : lookup(i - size(List.head(R)), List.tail(R))));

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
        : (i < size(List.head(R)) ?
            List.cons(
                updateTree(i, y, List.head(R)),
                List.tail(R))
        : List.cons(
            List.head(R),
            update(i - size(List.head(R)), y, List.tail(R)))));
}
