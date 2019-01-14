/*

Functional binomial heap implementation

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace BinomialHeap {
    export type Node<T> = (f: Selector<T>) => (number | T | List.List<Node<T>>);

    type Selector<T> = (rank: number, value: T, children: List.List<Node<T>>) =>
        (number | T | List.List<Node<T>>);

    export type Heap<T> = List.List<Node<T>>;

    export const EmptyHeap = List.EmptyList;

    export const isEmpty = (H: Heap<any>): boolean => (H === EmptyHeap);

    export const rank = <T>(t: Node<T>) => <number>t((r, v, c) => r);

    export const valueof = <T>(t: Node<T>) => <T>t((r, v, c) => v);

    export const children = <T>(t: Node<T>) => <Heap<T>>t((r, v, c) => c);

    export const createNode = <T>(r: number, v: T, c: Heap<T>): Node<T> =>
        <Node<T>>(f => f(r, v, c));

    // Link two nodes of equal rank.
    export const link = <T>(A: Node<T>, B: Node<T>): Node<T> =>
        (rank(A) !== rank(B) ?
            Util.raise('NotEqualRank')
        : (valueof(A) <= valueof(B) ?
            createNode(rank(A) + 1, valueof(A), List.cons(B, children(A)))
        : createNode(rank(A) + 1, valueof(B), List.cons(A, children(B)))));

    export const root = <T>(H: Heap<T>): Node<T> => List.head(H);

    // Insert a binomial tree into the heap.
    export const insertTree = <T>(t: Node<T>, H: Heap<T>): Heap<T> =>
        (isEmpty(H) ? List.cons(t, EmptyHeap)
        : rank(t) < rank(root(H)) ?
            List.cons(t, H)
        : insertTree(link(t, root(H)), List.tail(H)));

    // Insert a value into the heap.
    export const insert = <T>(val: T, H: Heap<T>): Heap<T> =>
        insertTree(createNode(0, val, EmptyHeap), H);

    // Merge two heaps.
    export const merge = <T>(A: Heap<T>, B: Heap<T>) =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : (rank(root(A)) < rank(root(B)) ?
            List.cons(root(A), merge(List.tail(A), B))
        : (rank(root(B)) < rank(root(A)) ?
            List.cons(root(B), merge(A, List.tail(B)))
        : insertTree(
            link(root(A), root(B)),
            merge(List.tail(A), List.tail(B)))))));

    // Remove min tree returns a list where the minimum tree in the
    // heap is at the head, and the rest of the heap is the tail.
    export const removeMinTree = <T>(H: Heap<T>): List.List<Node<T>> => {
        if (isEmpty(H)) Util.raise('EmptyHeap');
        if (List.length(H) === 1) return H;
        let val: List.List<Node<T>> = removeMinTree(List.tail(H));
        if (valueof(root(H)) < valueof(root(val)))
            return List.cons(root(H), List.tail(H));
        return List.cons(root(val), List.cons(root(H), List.tail(val)));
    };

    export const findMin = <T>(H: Heap<T>): Node<T> => root(removeMinTree(H));

    // Solution to exercise 3.5.
    export const findMin2 = <T>(H: Heap<T>): Node<T> => {
        if (isEmpty(H)) Util.raise('EmptyHeap');
        if (List.length(H) === 1) return root(H);
        let val: Node<T> = findMin2(List.tail(H));
        if (valueof(List.head(H)) < valueof(val))
            return List.head(H);
        return val;
    };
}
