/*

Splay heap is an efficient implementation of the heap
using a self-balancing binary tree

*/

import { BinaryTree } from '../chapter02/BinaryTree';
import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SplayHeap {
    export type Node<T> = BinaryTree.Node<T>;

    export const EmptyTree = BinaryTree.EmptyTree;

    export const isEmpty = BinaryTree.isEmpty;

    const createNode = BinaryTree.createTreeNode;

    // Tail optimized function traverses the tree and rotates any
    // left-left paths. This halves the height of the tree.
    // It is called on the right subtree of a new tree rooted at the pivot.
    const bigger = <T>(pivot: T, t: Node<T>): Node<T> => {
        let helper = Util.optimize<Node<T>>((pivot: T, t: Node<T>) =>
            (isEmpty(t) ?
                EmptyTree
            : (pivot <= BinaryTree.valueof(t) ?
                Util.optRecurse(
                    () => bigger(pivot, BinaryTree.right(t)))
            : (isEmpty(BinaryTree.left(t)) ?
                t
            : (BinaryTree.valueof(BinaryTree.left(t)) <= pivot ?
                Util.optRecurse(() =>
                    BinaryTree.createTreeNode(
                        bigger(pivot, BinaryTree.right(BinaryTree.left(t))),
                        BinaryTree.valueof(t),
                        BinaryTree.right(t)))
            : Util.optRecurse(() =>
                BinaryTree.createTreeNode(
                    bigger(pivot, BinaryTree.left(BinaryTree.left(t))),
                    BinaryTree.valueof(BinaryTree.left(t)),
                    BinaryTree.createTreeNode(
                        bigger(pivot, BinaryTree.right(BinaryTree.left(t))),
                        BinaryTree.valueof(t),
                        BinaryTree.right(t)))))))));
        return helper(pivot, t);
    };

    // Solution to exercise 5.4
    // Tail optimized function traverses the tree and rotates right-right
    // paths, cutting the height of the tree in half.
    // Both bigger and smaller also maintains the binary search tree invariant.
    export const smaller = <T>(pivot: T, t: Node<T>): Node<T> => {
        let helper = Util.optimize<Node<T>>((pivot: T, t: Node<T>) =>
            (isEmpty(t) ?
                EmptyTree
            : (pivot >= BinaryTree.valueof(t) ?
                Util.optRecurse(
                    () => smaller(pivot, BinaryTree.left(t)))
            : (isEmpty(BinaryTree.right(t)) ?
                t
            : (BinaryTree.valueof(BinaryTree.right(t)) >= pivot ?
                Util.optRecurse(() =>
                    BinaryTree.createTreeNode(
                        BinaryTree.left(t),
                        BinaryTree.valueof(t),
                        smaller(pivot, BinaryTree.left(BinaryTree.right(t)))))
            : Util.optRecurse(() =>
                BinaryTree.createTreeNode(
                    BinaryTree.createTreeNode(
                        BinaryTree.left(t),
                        BinaryTree.valueof(t),
                        smaller(pivot, BinaryTree.left(BinaryTree.right(t)))),
                    BinaryTree.valueof(BinaryTree.right(t)),
                    smaller(pivot, BinaryTree.right(BinaryTree.right(t))))))))));
        return helper(pivot, t);
    };

    // First insert implementation
    const insert1 = <T>(x: T, t: Node<T>): Node<T> =>
        BinaryTree.createTreeNode(smaller(x, t), x, bigger(x, t));

    type NodeTuple<T> = (f: Selector<T>) => Node<T>;

    type Selector<T> = (a: Node<T>, b: Node<T>) => Node<T>;

    const first = <T>(tup: NodeTuple<T>) => tup((a, b) => a);

    const second = <T>(tup: NodeTuple<T>) => tup((a, b) => b);

    const createNodeTuple = <T>(a: Node<T>, b: Node<T>) =>
        <NodeTuple<T>>(f => f(a, b));

    const partition = <T>(pivot: T, t: Node<T>): NodeTuple<T> => {
        let helper = Util.optimize<NodeTuple<T>>((pivot: T, t: Node<T>) => {
            if (isEmpty(t))
                return createNodeTuple(EmptyTree, EmptyTree);
            if (BinaryTree.valueof(t) <= pivot) {
                if (isEmpty(BinaryTree.right(t)))
                    return createNodeTuple(t, EmptyTree);
                if (BinaryTree.valueof(BinaryTree.right(t)) <= pivot)
                    return Util.optRecurse(() =>
                        ((val: NodeTuple<T>) =>
                            createNodeTuple(
                                createNode(
                                    createNode(
                                        BinaryTree.left(t),
                                        BinaryTree.valueof(t),
                                        BinaryTree.left(BinaryTree.right(t))),
                                    BinaryTree.valueof(BinaryTree.right(t)),
                                    first(val)),
                                second(val),
                            ))(partition(pivot, BinaryTree.right(BinaryTree.right(t)))));
                return Util.optRecurse(() =>
                    ((val: NodeTuple<T>) =>
                        createNodeTuple(
                            createNode(
                                BinaryTree.left(t),
                                BinaryTree.valueof(t),
                                first(val)),
                            createNode(
                                second(val),
                                BinaryTree.valueof(BinaryTree.right(t)),
                                BinaryTree.right(BinaryTree.right(t))),
                        ))(partition(pivot, BinaryTree.left(BinaryTree.right(t)))));
            }
            if (isEmpty(BinaryTree.left(t)))
                return createNodeTuple(EmptyTree, t);
            if (BinaryTree.valueof(BinaryTree.left(t)) <= pivot)
                return Util.optRecurse(() =>
                    ((val: NodeTuple<T>) =>
                        createNodeTuple(
                            createNode(
                                BinaryTree.left(BinaryTree.left(t)),
                                BinaryTree.valueof(BinaryTree.left(t)),
                                first(val)),
                            createNode(
                                second(val),
                                BinaryTree.valueof(t),
                                BinaryTree.right(t)),
                        ))(partition(pivot, BinaryTree.right(BinaryTree.left(t)))));
            return Util.optRecurse(() =>
                ((val: NodeTuple<T>) =>
                    createNodeTuple(
                        first(val),
                        createNode(
                            second(val),
                            BinaryTree.valueof(BinaryTree.left(t)),
                            createNode(
                                BinaryTree.right(BinaryTree.left(t)),
                                BinaryTree.valueof(t),
                                BinaryTree.right(t))),
                    ))(partition(pivot, BinaryTree.left(BinaryTree.left(t)))));
        });
        return <NodeTuple<T>>helper(pivot, t);
    };

    export const insert = <T>(e: T, t: Node<T>) => {
        let val = partition(e, t);
        return createNode(first(val), e, second(val));
    }

    export const merge = <T>(A: Node<T>, B: Node<T>): Node<T> => {
        let helper = Util.optimize<Node<T>>((A: Node<T>, B: Node<T>) => {
            if (isEmpty(A)) return B;
            let val = partition(BinaryTree.valueof(A), B);
            return Util.optRecurse(() =>
                createNode(
                    merge(first(val), BinaryTree.left(A)),
                    BinaryTree.valueof(A),
                    merge(second(val), BinaryTree.right(A))));
        });
        return helper(A, B);
    };

    export const findMin = <T>(t: Node<T>): T => {
        if (isEmpty(t))
            return Util.raise('Empty');
        let helper = Util.optimize<T>((t: Node<T>) =>
            (isEmpty(BinaryTree.left(t)) ?
                BinaryTree.valueof(t)
            : Util.optRecurse(
                () => findMin(BinaryTree.left(t)))));
        return <T>helper(t);
    };

    export const deleteMin = <T>(t: Node<T>): Node<T> => {
        if (isEmpty(t))
            return Util.raise('Empty');
        let helper = Util.optimize<Node<T>>((t: Node<T>) =>
            (isEmpty(BinaryTree.left(t)) ?
                EmptyTree
            : (isEmpty(BinaryTree.left(BinaryTree.left(t))) ?
                createNode(
                    BinaryTree.right(BinaryTree.left(t)),
                    BinaryTree.valueof(t),
                    BinaryTree.right(t))
            : Util.optRecurse(() =>
                createNode(
                    deleteMin(BinaryTree.left(BinaryTree.left(t))),
                    BinaryTree.valueof(BinaryTree.left(t)),
                    createNode(
                        BinaryTree.right(BinaryTree.left(t)),
                        BinaryTree.valueof(t),
                        BinaryTree.right(t)))))));
        return helper(t);
    };

    // Exercise 5.7 solution
    // Executes on an arbitrary list in O(n * log(n))
    export const sortList = <T>(L: List.List<T>): List.List<T> => {
        let buildList = (H: Node<T>, L: List.List<T>): List.List<T> => {
            let helper = Util.optimize<List.List<T>>((H: Node<T>, L: List.List<T>) =>
                (isEmpty(H) ? L
                : buildList(deleteMin(H), List.cons(findMin(H), L))));
            return helper(H, L);
        };
        return buildList(
            List.reduce(L, (h, el) => insert(el, h), <Node<T>>EmptyTree),
            <List.List<T>>List.EmptyList);
    };
}
