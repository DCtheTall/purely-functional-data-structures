/*

Binomial heap uses lazy evaluation
to achieve O(1) worst-case amortized
bounds for insert. All other operations
have an amortized cost of O(log(N)).

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace LazyBinomialHeap {
    type Tree<T> = (f: Selector<T>) => (number | T | TreeList<T>);

    type TreeList<T> = List.List<Tree<T>>;

    type Selector<T> = (rank: number, val: T, children: TreeList<T>) =>
        (number | T | TreeList<T>);

    export type Heap<T> = Util.LazyFunction<TreeList<T>>;

    export const EmptyHeap = Util.lazy(() => List.EmptyList);

    export const isEmpty = <T>(H: Heap<T>) => List.isEmpty(Util.force(H));

    const rank = <T>(t: Tree<T>) => <number>t((r, v, c) => r);

    const root = <T>(t: Tree<T>) => <T>t((r, v, c) => v);

    const children = <T>(t: Tree<T>) => <TreeList<T>>t((r, v, c) => c);

    const createTree = <T>(r: number, val: T, ch: TreeList<T>) =>
        <Tree<T>>(t => t(r, val, ch));

    const link = <T>(t1: Tree<T>, t2: Tree<T>): Tree<T> =>
        (root(t1) <= root(t2) ?
            createTree(rank(t1) + 1, root(t1), List.cons(t2, children(t1)))
        : createTree(rank(t2) + 1, root(t2), List.cons(t1, children(t2))));

    const insTree = <T>(t: Tree<T>, tL: TreeList<T>): TreeList<T> => {
        let helper = Util.optimize<TreeList<T>>((t: Tree<T>, tL: TreeList<T>) =>
            (List.isEmpty(tL) ?
                <TreeList<T>>List.cons(t, List.EmptyList)
            : (rank(t) < rank(List.head(tL)) ?
                List.cons(t, tL)
            : Util.optRecurse(() =>
                insTree(link(t, List.head(tL)), List.tail(tL))))));
        return helper(t, tL);
    };

    const mrg = <T>(t1: TreeList<T>, t2: TreeList<T>): TreeList<T> => {
        let helper = Util.optimize<TreeList<T>>((t1: TreeList<T>, t2: TreeList<T>) =>
            (List.isEmpty(t1) ? t2
            : (List.isEmpty(t2) ? t1
            : (rank(List.head(t1)) < rank(List.head(t2)) ?
                Util.optRecurse(() =>
                    List.cons(List.head(t1), mrg(List.tail(t1), t2)))
            : (rank(List.head(t2)) < rank(List.head(t1)) ?
                Util.optRecurse(() =>
                    List.cons(List.head(t2), mrg(t1, List.tail(t2))))
            : Util.optRecurse(() =>
                List.cons(
                    link(List.head(t1), List.head(t2)),
                    mrg(List.tail(t1), List.tail(t2)))))))));
        return helper(t1, t2);
    };

    export const insert = <T>(e: T, h: Heap<T>) =>
        Util.lazy(() => insTree(createTree(0, e, List.EmptyList), Util.force(h)));

    export const merge = <T>(h1: Heap<T>, h2: Heap<T>) =>
        Util.lazy(() => mrg(Util.force(h1), Util.force(h2)));

    const removeMinTree = <T>(t: TreeList<T>): TreeList<T> => {
        let helper = Util.optimize<TreeList<T>>((t: TreeList<T>) =>
            (List.isEmpty(t) ?
                Util.raise('Empty')
            : (List.isEmpty(List.tail(t)) ?
                List.EmptyList
            : Util.optRecurse(() =>
                (((val) =>
                    (root(List.head(t)) < root(List.head(val)) ?
                        t
                    : List.cons(
                        List.head(val),
                        List.cons(List.head(t), List.tail(val))))
                )(removeMinTree(List.tail(t))))))));
        return helper(t);
    };

    export const findMin = <T>(h: Heap<T>): T =>
        root(List.head(removeMinTree(Util.force(h))));

    export const deleteMin = <T>(h: Heap<T>): Heap<T> =>
        Util.lazy(() => {
            let minTree = removeMinTree(Util.force(h));
            return mrg(List.reverse(
                children(List.head(minTree))),
                List.tail(minTree));
        });
}

// TODO refactor using SizedHeap functor
// Solution to exercise 6.5, add an explict size to th
export namespace SizedBinomialHeap {
    export type Heap<T> = (f: Selector<T>) => (number | LazyBinomialHeap.Heap<T>);

    type Selector<T> = (size: number, heap: LazyBinomialHeap.Heap<T>) =>
        (number | LazyBinomialHeap.Heap<T>);

    const size = <T>(sh: Heap<T>) => <number>sh((s, h) => s);

    const heap = <T>(sh: Heap<T>) => <LazyBinomialHeap.Heap<T>>sh((s, h) => h);

    export const EmptyHeap = <Heap<any>>(h => h(0, LazyBinomialHeap.EmptyHeap));

    export const isEmpty = <T>(h: Heap<T>) => (size(h) === 0);

    const createSizedHeap = <T>(size: number, h: LazyBinomialHeap.Heap<T>) =>
        <Heap<T>>(sh => sh(size, h));

    export const insert = <T>(e: T, sh: Heap<T>): Heap<T> =>
        createSizedHeap(size(sh) + 1, LazyBinomialHeap.insert(e, heap(sh)));

    export const merge = <T>(sh1: Heap<T>, sh2: Heap<T>) =>
        createSizedHeap(
            size(sh1) + size(sh2),
            LazyBinomialHeap.merge(heap(sh1), heap(sh2)));

    export const findMin = <T>(sh: Heap<T>) =>
        LazyBinomialHeap.findMin(heap(sh));

    export const deleteMin = <T>(sh: Heap<T>) =>
        createSizedHeap(size(sh) - 1, LazyBinomialHeap.deleteMin(heap(sh)));
}
