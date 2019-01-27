/*

Splay heap is an efficient implementation of the heap
using a self-balancing binary tree

*/

import { BinaryTree } from '../chapter02/BinaryTree';
import { Util } from '../util';

export namespace SplayHeap {
    export type Node<T> = BinaryTree.Node<T>;

    export const EmptyTree = BinaryTree.EmptyTree;

    export const isEmpty = BinaryTree.isEmpty;

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
}
