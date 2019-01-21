/*

Functional binomial heap implementation

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace BinomialHeap {
    export type Node<T> = (f: Selector<T>) => (number | T | List.List<Node<T>>);

    type Selector<T> = (rank: number, value: T, children: List.List<Node<T>>) =>
        (number | T | List.List<Node<T>>);

    export const rank = <T>(t: Node<T>) => <number>t((r, v, c) => r);

    export const valueof = <T>(t: Node<T>) => <T>t((r, v, c) => v);

    export const children = <T>(t: Node<T>) => <Heap<T>>t((r, v, c) => c);

    export const createNode = <T>(r: number, v: T, c: Heap<T>) =>
        <Node<T>>(f => f(r, v, c));

    // Link two nodes of equal rank.
    export const link = <T>(A: Node<T>, B: Node<T>): Node<T> =>
        (rank(A) !== rank(B) ?
            Util.raise('NotEqualRank')
        : (valueof(A) <= valueof(B) ?
            createNode(rank(A) + 1, valueof(A), List.cons(B, children(A)))
        : createNode(rank(A) + 1, valueof(B), List.cons(A, children(B)))));

    export type Heap<T> = List.List<Node<T>>;

    export const EmptyHeap = List.EmptyList;

    export const isEmpty = (H: Heap<any>): boolean => (H === EmptyHeap);

    export const root = <T>(H: Heap<T>): Node<T> => List.head(H);

    // Insert a binomial tree into the heap.
    export const insertTree = <T>(t: Node<T>, H: Heap<T>): Heap<T> =>
        (isEmpty(H) ? List.cons(t, EmptyHeap)
        : (rank(t) < rank(root(H)) ?
            List.cons(t, H)
        : (rank(t) > rank(root(H)) ?
            List.cons(root(H), insertTree(t, List.tail(H)))
        : insertTree(link(t, root(H)), List.tail(H)))));

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

    // findMin in O(log(N)) time
    export const logNfindMin = <T>(H: Heap<T>): Node<T> => root(removeMinTree(H));

    // Solution to exercise 3.5. O(log(N)) time.
    export const logNfindMin2 = <T>(H: Heap<T>): Node<T> => {
        if (isEmpty(H)) Util.raise('EmptyHeap');
        if (List.length(H) === 1) return root(H);
        let val: Node<T> = logNfindMin2(List.tail(H));
        if (valueof(root(H)) < valueof(val))
            return root(H);
        return val;
    };
}

// Solution to exercise 3.6
export namespace RankBinomialHeap {
    // Node type without the rank
    export type RanklessNode<T> = (f: RanklessSelector<T>) =>
        (T | List.List<RanklessNode<T>>);

    export type RanklessSelector<T> = (value: T, children: List.List<RanklessNode<T>>) =>
        (T | List.List<RanklessNode<T>>);

    export const ranklessValueof = <T>(t: RanklessNode<T>) => <T>t((v, c) => v);

    export const ranklessChildren = <T>(t: RanklessNode<T>) =>
        <List.List<RanklessNode<T>>>t((v, c) => c);

    export const createRanklessNode =
        <T>(val: T, c: List.List<RanklessNode<T>>) => <RanklessNode<T>>(f => f(val, c));

    // Merge two nodes, we can only assume they are equal rank.
    export const ranklessLink =
        <T>(A: RanklessNode<T>, B: RanklessNode<T>): RanklessNode<T> =>
            (ranklessValueof(A) <= ranklessValueof(B) ?
                createRanklessNode(
                    ranklessValueof(A),
                    List.cons(B, ranklessChildren(A)))
            : createRanklessNode(
                ranklessValueof(B),
                List.cons(A, ranklessChildren(B))));

    // This is the type that will be stored in the heap
    export type RankNode<T> = (f: RankNodeSelector<T>) => (number | RanklessNode<T>);

    export type RankNodeSelector<T> =
        (r: number, node: RanklessNode<T>) => (number | RanklessNode<T>);

    export const rank = <T>(t: RankNode<T>) => <number>t((r, n) => r);

    export const getRanklessNode = <T>(t: RankNode<T>) =>
        <RanklessNode<T>>t((r, n) => n);

    export type RankHeap<T> = List.List<RankNode<T>>;

    export const createRankNode = <T>(r: number, n: RanklessNode<T>) =>
        <RankNode<T>>(f => f(r, n));

    export const EmptyRankHeap = List.EmptyList;

    export const isEmptyRankHeap =
        <T>(rh: RankHeap<T>): boolean => (rh === EmptyRankHeap);

    export const root = <T>(rh: RankHeap<T>): RankNode<T> => List.head(rh);

    export const rankHeapInsertTree =
        <T>(t: RankNode<T>, rh: RankHeap<T>): RankHeap<T> =>
            (isEmptyRankHeap(rh) ?
                List.cons(t, EmptyRankHeap)
            : (rank(t) < rank(root(rh)) ?
                List.cons(t, rh)
            : (rank(t) > rank(root(rh)) ?
                List.cons(
                    root(rh),
                    rankHeapInsertTree(t, List.tail(rh)))
            : rankHeapInsertTree(
                createRankNode(
                    rank(t) + 1,
                    ranklessLink(
                        getRanklessNode(t),
                        getRanklessNode(root(rh)))),
                List.tail(rh)))));

    export const rankHeapInsert =
        <T>(val: T, rh: RankHeap<T>): RankHeap<T> =>
            rankHeapInsertTree(
                createRankNode(0, createRanklessNode(val, List.EmptyList)),
                rh);

    export const removeMinRankTree = <T>(rh: RankHeap<T>): List.List<RankNode<T>> => {
        if (isEmptyRankHeap(rh)) Util.raise('EmptyHeap');
        if (List.length(rh) === 1) return rh;
        let val: List.List<RankNode<T>> = removeMinRankTree(List.tail(rh));
        if (ranklessValueof(getRanklessNode(root(rh))) <
            ranklessValueof(getRanklessNode(root(val))))
                return List.cons(root(rh), List.tail(rh));
        return List.cons(root(val), List.cons(root(rh), List.tail(val)));
    };

    export const logNfindMin = <T>(rh: RankHeap<T>): RankNode<T> =>
        root(removeMinRankTree(rh));

    export const logNfindMin2 = <T>(rh: RankHeap<T>): RankNode<T> => {
        if (isEmptyRankHeap(rh)) Util.raise('EmptyHeap');
        if (List.length(rh) === 1) return root(rh);
        let val: RankNode<T> = logNfindMin2(List.tail(rh));
        if (ranklessValueof(getRanklessNode(root(rh))) <
            ranklessValueof(getRanklessNode(val)))
                return root(rh);
        return val;
    };
}

// Exercise 3.7: Implement BinomialHeap which can do findMin in O(1)
