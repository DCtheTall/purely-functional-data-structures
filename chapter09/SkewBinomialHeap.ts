/*

Skew binomial heap implementation. This heap has
the interesting property of insert taking only
constant time.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SkewBinomialHeap {
    type Tree<T> = (f: Selector<T>) => (number | T | List.List<T> | Heap<T>);

    type Selector<T> =
        (rank: number, root: T, elems: List.List<T>, children: Heap<T>) =>
            (number | T | List.List<T> | Heap<T>);

    export type Heap<T> = List.List<Tree<T>>;

    const rank = <T>(Tr: Tree<T>) => <number>Tr((rk, rt, vs, ch) => rk);

    const root = <T>(Tr: Tree<T>) => <T>Tr((rk, rt, vs, ch) => rt);

    const values = <T>(Tr: Tree<T>) => <List.List<T>>Tr((rk, rt, vs, ch) => vs);

    const children = <T>(Tr: Tree<T>) => <Heap<T>>Tr((rk, rt, vs, ch) => ch);

    const createTree = <T>(rk: number, rt: T, vals: List.List<T>, ch: Heap<T>) =>
        (<Tree<T>>(Tr => Tr(rk, rt, vals, ch)));

    export const EmptyHeap = <Heap<any>>List.EmptyList;

    export const isEmpty = List.isEmpty;

    const link = <T>(T1: Tree<T>, T2: Tree<T>): Tree<T> =>
        (root(T1) <= root(T2) ?
            createTree(
                rank(T1) + 1,
                root(T1),
                values(T1),
                List.cons(T2, children(T1)))
        : createTree(
            rank(T2) + 1,
            root(T2),
            values(T2),
            List.cons(T1, children(T2))));

    const skewLink = <T>(x: T, T1: Tree<T>, T2: Tree<T>): Tree<T> => {
        let linked = link(T1, T2);
        if (x <= root(linked))
            return createTree(
                rank(linked),
                x,
                List.cons(root(linked), values(linked)),
                children(linked));
        return createTree(
            rank(linked),
            root(linked),
            List.cons(x, values(linked)),
            children(linked));
    };

    const insTree = <T>(Tr: Tree<T>, H: Heap<T>): Heap<T> =>
        (isEmpty(H) ?
            List.cons(Tr, H)
        : (rank(Tr) < rank(List.head(H)) ?
            List.cons(Tr, H)
        : List.cons(link(Tr, List.head(H)), List.tail(H))));

    const mergeTrees = <T>(H1: Heap<T>, H2: Heap<T>): Heap<T> =>
        (isEmpty(H1) ? H2
        : (isEmpty(H2) ? H1
        : (rank(List.head(H1)) < rank(List.head(H2)) ?
            List.cons(List.head(H1), mergeTrees(List.tail(H1), H2))
        : (rank(List.head(H2)) < rank(List.head(H1)) ?
            List.cons(List.head(H2), mergeTrees(H1, List.tail(H2)))
        : List.cons(
            link(List.head(H1), List.head(H2)),
            mergeTrees(List.tail(H1), List.tail(H2)))))));

    const normalize = <T>(H: Heap<T>): Heap<T> =>
        (isEmpty(H) ? EmptyHeap
        : insTree(List.head(H), List.tail(H)));

    export const insert = <T>(x: T, H: Heap<T>): Heap<T> =>
        (isEmpty(H) || isEmpty(List.tail(H)) ?
            List.cons(
                createTree(0, x, List.EmptyList, List.EmptyList),
                H)
        : (rank(List.head(H)) === rank(List.head(List.tail(H))) ?
            List.cons(
                skewLink(x, List.head(H), List.head(List.tail(H))),
                List.tail(List.tail(H)))
        : List.cons(
                createTree(0, x, List.EmptyList, List.EmptyList),
                H)));

    export const merge = <T>(H1: Heap<T>, H2: Heap<T>): Heap<T> =>
        mergeTrees(normalize(H1), normalize(H2));

    // Moves the tree with the smallest root to the front of the
    // heap
    const removeMinTree = <T>(H: Heap<T>): Heap<T> => {
        if (isEmpty(H))
            Util.raise('EmptyHeap');
        let val = removeMinTree(List.tail(H));
        if (root(List.head(H)) <= root(List.head(val)))
            return H;
        return List.cons(
            List.head(val),
            List.cons(List.head(H), List.tail(val)));
    };

    // This can be improved to O(1) time with the ExplicitMin functor
    export const findMin = <T>(H: Heap<T>): T =>
        root(List.head(removeMinTree(H)));

    const insertAll = <T>(xs: List.List<T>, H: Heap<T>): Heap<T> =>
        (List.isEmpty(xs) ? H
        : insertAll(List.tail(xs), insert(List.head(xs), H)));

    export const deleteMin = <T>(H: Heap<T>): Heap<T> => {
        let val = removeMinTree(H);
        return insertAll(
            values(List.head(val)),
            merge(
                List.reverse(children(List.head(val))),
                List.tail(val)));
    };
}
