/*

Pairing Heap implementation

*/

import { BinaryTree } from '../chapter02/BinaryTree';
import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace PairingHeap {
    export type Heap<T> = (f: Selector<T>) => (T | List.List<Heap<T>>);

    type Selector<T> = (el: T, children: List.List<Heap<T>>) => (T | List.List<Heap<T>>);

    const EmptyHeap = <Heap<any>>null;

    export const isEmpty = <T>(H: Heap<T>) => (H === EmptyHeap);

    export const findMin = <T>(H: Heap<T>) => <T>H((el, ch) => el);

    export const children = <T>(H: Heap<T>) => <List.List<Heap<T>>>H((el, ch) => ch);

    const createNode = <T>(el: T, L: List.List<Heap<T>>): Heap<T> =>
        H => H(el, L);

    const merge = <T>(A: Heap<T>, B: Heap<T>): Heap<T> =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : findMin(A) <= findMin(B) ?
            createNode(findMin(A), List.cons(B, children(A)))
        : createNode(findMin(B), List.cons(A, children(B)))));

    export const insert = <T>(el: T, H: Heap<T>): Heap<T> =>
        merge(createNode(el, List.EmptyList), H);

    const mergePairs = <T>(L: List.List<Heap<T>>): Heap<T> =>
        (List.isEmpty(L) ? EmptyHeap
        : (List.isEmpty(List.tail(L)) ? List.head(L)
        : merge(
            merge(List.head(L), List.head(List.tail(L))),
            mergePairs(List.tail(List.tail(L))))));

    export const deleteMin = <T>(H: Heap<T>): Heap<T> =>
        (isEmpty(H) ?
            Util.raise('Empty')
        : mergePairs(children(H)));
}

// Solution to exercise 5.8a
export namespace BinaryPairingHeap {
    export type Heap<T> = BinaryTree.Node<T>;

    export const EmptyHeap = BinaryTree.EmptyTree;

    export const isEmpty = BinaryTree.isEmpty;

    export const findMin = BinaryTree.valueof;

    // Recall the root of these trees never has a right child
    const merge = <T>(A: Heap<T>, B: Heap<T>): Heap<T> =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : (findMin(A) <= findMin(B) ?
            BinaryTree.createTreeNode(
                BinaryTree.createTreeNode(
                    BinaryTree.left(B),
                    findMin(B),
                    BinaryTree.left(A)),
                findMin(A),
                EmptyHeap)
        : BinaryTree.createTreeNode(A, findMin(B), EmptyHeap))));

    export const insert = <T>(el: T, H: Heap<T>): Heap<T> =>
        merge(BinaryTree.createTreeNode(EmptyHeap, el, EmptyHeap), H);

    const mergePairs = <T>(H: Heap<T>): Heap<T> =>
        (isEmpty(H) ?
            EmptyHeap
        : (isEmpty(BinaryTree.right(H)) ?
            H
        : merge(
            merge(
                BinaryTree.createTreeNode(
                    BinaryTree.left(H),
                    BinaryTree.valueof(H),
                    EmptyHeap),
                BinaryTree.createTreeNode(
                    BinaryTree.left(BinaryTree.right(H)),
                    BinaryTree.valueof(BinaryTree.right(H)),
                    EmptyHeap)),
            mergePairs(
                BinaryTree.right(BinaryTree.right(H))))));

    export const deleteMin = <T>(H: Heap<T>) => mergePairs(BinaryTree.left(H));

    // Solution to 5.8b
    export const toBinary = <T>(H: PairingHeap.Heap<T>): Heap<T> => {
        let recursiveHelper = (H: PairingHeap.Heap<T>, L: List.List<PairingHeap.Heap<T>>) =>
            (PairingHeap.isEmpty(H) ?
                EmptyHeap
            : (List.isEmpty(PairingHeap.children(H)) && List.isEmpty(L) ?
                BinaryTree.createTreeNode(
                    EmptyHeap,
                    PairingHeap.findMin(H),
                    EmptyHeap)
            : (List.isEmpty(PairingHeap.children(H)) ?
                BinaryTree.createTreeNode(
                    EmptyHeap,
                    PairingHeap.findMin(H),
                    recursiveHelper(List.head(L), List.tail(L)))
            : (List.isEmpty(L) ?
                BinaryTree.createTreeNode(
                    recursiveHelper(
                        List.head(PairingHeap.children(H)),
                        List.tail(PairingHeap.children(H))),
                    PairingHeap.findMin(H),
                    EmptyHeap)
            : BinaryTree.createTreeNode(
                recursiveHelper(
                    List.head(PairingHeap.children(H)),
                    List.tail(PairingHeap.children(H))),
                PairingHeap.findMin(H),
                recursiveHelper(List.head(L), List.tail(L)))))));
        return recursiveHelper(H, List.EmptyList);
    };
}
