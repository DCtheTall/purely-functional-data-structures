/*

Functional binomial heap implementation

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

// Solution to exercise 3.8
export namespace MinBinomialHeap {
    type Node<T> = (f: NodeSelector<T>) => (number | T | Heap<T>);

    type NodeSelector<T> = (rank: number, value: T, children: Heap<T>) =>
        (number | T | Heap<T>);

    type Heap<T> = List.List<Node<T>>;

    export type MinHeap<T> = (f: HeapSelector<T>) => (T | Heap<T>);

    type HeapSelector<T> = (min: T, H: Heap<T>) => (T | Heap<T>);

    const rank = <T>(t: Node<T>) => <number>t((r, v, c) => r);

    const valueof = <T>(t: Node<T>) => <T>t((r, v, c) => v);

    const children = <T>(t: Node<T>) => <Heap<T>>t((r, v, c) => c);

    const createNode = <T>(r: number, v: T, c: Heap<T>) =>
        <Node<T>>(f => f(r, v, c));

    // findMin takes O(1) time, as the exercise specifies
    const findMin = <T>(M: MinHeap<T>) => <T>M((m, H) => m);

    const heap = <T>(M: MinHeap<T>) => <Heap<T>>M((m, H) => H);

    const root = <T>(H: Heap<T>): Node<T> => List.head(H);

    // Link two nodes of equal rank.
    const link = <T>(A: Node<T>, B: Node<T>): Node<T> =>
        (rank(A) !== rank(B) ?
            Util.raise('NotEqualRank')
        : (valueof(A) <= valueof(B) ?
            createNode(rank(A) + 1, valueof(A), List.cons(B, children(A)))
        : createNode(rank(A) + 1, valueof(B), List.cons(A, children(B)))));

    const createMinHeap = <T>(m: T, H: Heap<T>) => <MinHeap<T>>(M => M(m, H));

    export const EmptyMinHeap = createMinHeap(Infinity, <Heap<any>>List.EmptyList);

    export const isEmpty = <T>(M: MinHeap<T>) => (M === EmptyMinHeap);

    const insertTreeIntoHeap = <T>(t: Node<T>, H: Heap<T>) => {
        let helper = Util.optimize<Heap<T>>((t: Node<T>, H: Heap<T>) =>
            (rank(t) < rank(root(H)) ?
                List.cons(t, H)
            : (rank(t) > rank(root(H)) ?
                Util.optRecurse(
                    () => List.cons(root(H), insertTreeIntoHeap(t, List.tail(H))))
            : Util.optRecurse(
                () => insertTreeIntoHeap(link(t, root(H)), List.tail(H))))));
        return helper(t, H);
    };

    const insertTree = <T>(t: Node<T>, M: MinHeap<T>): MinHeap<T> =>
        (isEmpty(M) ?
            createMinHeap(valueof(t), List.cons(t, List.EmptyList))
        : (valueof(t) < findMin(M) ?
            createMinHeap(valueof(t), insertTreeIntoHeap(t, heap(M)))
        : createMinHeap(findMin(M), insertTreeIntoHeap(t, heap(M)))));

    export const insert = <T>(val: T, M: MinHeap<T>): MinHeap<T> =>
        insertTree(createNode(0, val, List.EmptyList), M);

    const mergeHeaps = <T>(A: Heap<T>, B: Heap<T>): Heap<T> => {
        let helper = Util.optimize<Heap<T>>((A: Heap<T>, B: Heap<T>) =>
            (List.isEmpty(A) ? B
            : (List.isEmpty(B) ? A
            : (rank(root(A)) < rank(root(B)) ?
                Util.optRecurse(
                    () => List.cons(root(A), mergeHeaps(List.tail(A), B)))
            : (rank(root(B)) < rank(root(A)) ?
                Util.optRecurse(
                    () => List.cons(root(B), mergeHeaps(A, List.tail(B))))
            : Util.optRecurse(
                () => insertTreeIntoHeap(
                    link(root(A), root(B)),
                    mergeHeaps(List.tail(A), List.tail(B)))))))));
        return helper(A, B);
    };

    export const merge = <T>(A: MinHeap<T>, B: MinHeap<T>): MinHeap<T> =>
        (findMin(A) < findMin(B) ? createMinHeap(findMin(A), mergeHeaps(heap(A), heap(B)))
        : createMinHeap(findMin(B), mergeHeaps(heap(A), heap(B))));

    // Extract the min tree in O(log(N)) time
    // Optimized with tail call recursion to allow heaps of unbounded size
    const removeMinTree = <T>(H: Heap<T>): Heap<T> => {
        if (List.isEmpty(H)) Util.raise('EmptyHeap');
        // Recursively find the min using tail recursion
        // O(log(N)) time
        let findMinTree = (cur: Node<T>, H: Heap<T>): Node<T> => {
            let helper = Util.optimize<Node<T>>((cur: Node<T>, H: Heap<T>): Node<T> =>
                (List.length(H) === 0 ? cur
                : (valueof(cur) < valueof(root(H)) ?
                    <Node<T>>Util.optRecurse(() => findMinTree(cur, List.tail(H)))
                : <Node<T>>Util.optRecurse(() => findMinTree(root(H), List.tail(H))))));
            return <Node<T>>helper(cur, H);
        };
        let minTree = findMinTree(root(H), List.tail(H));
        // Recursively find the elements on each side
        // O(log(N)) time
        let partitionHeap = (L: Heap<T>, R: Heap<T>): List.List<Heap<T>> => {
            let helper = Util.optimize<List.List<Heap<T>>>(
                (L: Heap<T>, R: Heap<T>): List.List<Heap<T>> =>
                    (root(R) === minTree ?
                        List.cons(L, List.cons(R, List.EmptyList))
                    : Util.optRecurse(
                        () => partitionHeap(List.cons(root(R), L), List.tail(R)))));
            return helper(List.EmptyList, H);
        };
        let partitionedHeap = partitionHeap(H, List.EmptyList);
        // Concat the partitioned heap in O(log(N)) time and return the result
        // with the min tree
        return List.cons(minTree, List.concat(
           List.head(partitionedHeap), List.head(List.tail(partitionedHeap))));
    };

    // Delete the minimum element in O(log(N)) time
    export const deleteMin = <T>(M: MinHeap<T>): MinHeap<T> => {
        let minTreeResult = removeMinTree(heap(M));
        // If the value of the root of the min tree is the current min
        // find the new min also in O(log(N)) time
        if (valueof(List.head(minTreeResult)) === findMin(M))
            return createMinHeap(
                valueof(List.head(removeMinTree(List.tail(minTreeResult)))),
                mergeHeaps(
                    List.tail(minTreeResult),
                    children(List.head(minTreeResult))));
        return createMinHeap(
            findMin(M),
            mergeHeaps(
                List.tail(minTreeResult),
                children(List.head(minTreeResult))))
    };
}

export namespace BinomialHeap {
    type Node<T> = (f: Selector<T>) => (number | T | Heap<T>);

    type Selector<T> = (rank: number, value: T, children: Heap<T>) =>
        (number | T | Heap<T>);

    export type Heap<T> = List.List<Node<T>>;

    const rank = <T>(t: Node<T>) => <number>t((r, v, c) => r);

    const valueof = <T>(t: Node<T>) => <T>t((r, v, c) => v);

    const children = <T>(t: Node<T>) => <Heap<T>>t((r, v, c) => c);

    const createNode = <T>(r: number, v: T, c: Heap<T>) =>
        <Node<T>>(f => f(r, v, c));

    // Link two nodes of equal rank.
    const link = <T>(A: Node<T>, B: Node<T>): Node<T> =>
        (rank(A) !== rank(B) ?
            Util.raise('NotEqualRank')
        : (valueof(A) <= valueof(B) ?
            createNode(rank(A) + 1, valueof(A), List.cons(B, children(A)))
        : createNode(rank(A) + 1, valueof(B), List.cons(A, children(B)))));

    export const EmptyHeap = List.EmptyList;

    export const isEmpty = (H: Heap<any>): boolean => (H === EmptyHeap);

    const root = <T>(H: Heap<T>): Node<T> => List.head(H);

    // Insert a binomial tree into the heap.
    const insertTree = <T>(t: Node<T>, H: Heap<T>): Heap<T> =>
        (isEmpty(H) ? List.cons(t, EmptyHeap)
        : (rank(t) < rank(root(H)) ?
            List.cons(t, H)
        : (rank(t) > rank(root(H)) ?
            List.cons(root(H), insertTree(t, List.tail(H)))
        : insertTree(link(t, root(H)), List.tail(H)))));

    // Insert a value into the heap.
    export const insert = <T>(val: T, H: Heap<T>): Heap<T> =>
        insertTree(createNode(0, val, EmptyHeap), H);

    // Merge two heaps in O(log(N)) time
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
    // This function can also be thought of as bringing the min heap
    // to the head of the heap list.
    const removeMinTree = <T>(H: Heap<T>): Heap<T> => {
        if (isEmpty(H)) Util.raise('EmptyHeap');
        if (List.length(H) === 1) return H;
        let minTree: Heap<T> = removeMinTree(List.tail(H));
        if (valueof(root(H)) < valueof(root(minTree)))
            return List.cons(root(H), List.tail(H));
        return List.cons(root(minTree), List.cons(root(H), List.tail(minTree)));
    };

    // findMin in O(log(N)) time
    export const findMin = <T>(H: Heap<T>): Node<T> => root(removeMinTree(H));

    // Solution to exercise 3.5. O(log(N)) time.
    export const findMin2 = <T>(H: Heap<T>): Node<T> => {
        if (isEmpty(H)) Util.raise('EmptyHeap');
        if (List.length(H) === 1) return root(H);
        let val: Node<T> = findMin2(List.tail(H));
        if (valueof(root(H)) < valueof(val))
            return root(H);
        return val;
    };

    // Delete the minimum element in O(log(N)) time
    export const deleteMin = <T>(H: Heap<T>): Heap<T> => {
        let minTree = removeMinTree(H);
        return merge(children(List.head(minTree)), List.tail(minTree));
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
