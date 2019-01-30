/*

Pairing Heap implementation

*/

import { BinaryTree } from '../chapter02/BinaryTree';
import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace PairingHeap {
    export type Node<T> = (f: Selector<T>) => (T | List.List<Node<T>>);

    type Selector<T> = (el: T, children: List.List<Node<T>>) => (T | List.List<Node<T>>);

    const EmptyHeap = <Node<any>>null;

    export const isEmpty = <T>(H: Node<T>) => (H === EmptyHeap);

    export const findMin = <T>(H: Node<T>) => <T>H((el, ch) => el);

    const children = <T>(H: Node<T>) => <List.List<Node<T>>>H((el, ch) => ch);

    const createNode = <T>(el: T, L: List.List<Node<T>>): Node<T> =>
        H => H(el, L);

    const merge = <T>(A: Node<T>, B: Node<T>): Node<T> =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : findMin(A) <= findMin(B) ?
            createNode(findMin(A), List.cons(B, children(A)))
        : createNode(findMin(B), List.cons(A, children(B)))));

    export const insert = <T>(el: T, H: Node<T>): Node<T> =>
        merge(createNode(el, List.EmptyList), H);

    const mergePairs = <T>(L: List.List<Node<T>>): Node<T> => {
        let helper = Util.optimize<Node<T>>((L: List.List<Node<T>>) =>
            (List.isEmpty(L) ? EmptyHeap
            : (List.isEmpty(List.tail(L)) ? List.head(L)
            : Util.optRecurse(() =>
                merge(
                    merge(List.head(L), List.head(List.tail(L))),
                    mergePairs(List.tail(List.tail(L))))))));
        return <Node<T>>helper(L);
    };

    export const deleteMin = <T>(H: Node<T>) => mergePairs(children(H));
}

// Solution to exercise 5.8
export namespace BinaryPairingHeap {
    export type Node<T> = BinaryTree.Node<T>;

    export const EmptyHeap = BinaryTree.EmptyTree;

    export const isEmpty = BinaryTree.isEmpty;

    export const findMin = BinaryTree.valueof;

    // TODO verify this by drawing graph
    const merge = <T>(A: Node<T>, B: Node<T>): Node<T> =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : (findMin(A) <= findMin(B) ?
            BinaryTree.createTreeNode(B, findMin(A), EmptyHeap)
        : BinaryTree.createTreeNode(A, findMin(B), EmptyHeap))));

    // export const insert = <T>(el: T, H: Node<T>) =>
    //     merge(BinaryTree.createTreeNode(EmptyHeap, el, EmptyHeap), H);

    // const mergePairs = <T>(A: Node<T>): Node<T> => {
    //     let helper = Util.optimize<Node<T>>((A: Node<T>) =>
    //         (isEmpty(A) ? EmptyHeap
    //         : (isEmpty(BinaryTree.right(A)) ? A
    //         : Util.optRecurse(() =>
    //             merge(
    //                 merge(
    //                     A,
    //                     BinaryTree.createTreeNode(
    //                         BinaryTree.left(BinaryTree.right(A)),
    //                         BinaryTree.valueof(BinaryTree.right(A)),
    //                         EmptyHeap)),
    //                     mergePairs(BinaryTree.right(BinaryTree.right(A))),
    //             )))));
    //     return helper(A);
    // };

    // export const deleteMin = <T>(H: Node<T>) => mergePairs(BinaryTree.left(H));
}
