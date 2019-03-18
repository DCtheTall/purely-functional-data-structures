/*

BootstrappedHeap implementation. The style I had
been using does not lend itself well to overloading
the comparison operations. So I am implementing this
using a different pattern.

*/

// Abstract comparison functions

const less = <T>(A: T, B: T): boolean =>
    ((A && (<any>A).less &&
        (typeof (<any>A).less === 'function')) ?
            (<any>A).less(B)
    : (A < B));

const equal = <T>(A: T, B: T): boolean =>
    ((A && (<any>A).eq &&
        (typeof (<any>A).eq === 'function')) ?
            (<any>A).eq(B)
    : (A === B));

const leq = <T>(A: T, B: T): boolean => (less(A, B) || equal(A, B));

const geq = <T>(A: T, B: T): boolean => !less(A, B);

const greater = <T>(A: T, B: T): boolean => (geq(A, B) && !equal(A, B));

// Basic list implementation.

class List<T> {
    constructor(
        public readonly head: T,
        public readonly tail: List<T>,
    ) {}
}

const EmptyList = <List<any>>null;

const isEmptyList = (L: List<any>) => (L === EmptyList);

const cons = <T>(x: T, L: List<T>) => new List(x, L);

const reverse = <T>(L: List<T>) => {
    let helper = (L: List<T>, R: List<T>) => {
        if (isEmptyList(L))
            return R;
        return helper(L.tail, cons(L.head, R));
    }
    return helper(L, EmptyList);
}

// Skew Binomial Heap implementation

class Tree<T> {
    constructor(
        public readonly rank: number,
        public readonly root: T,
        public readonly values: List<T>,
        public readonly children: SkewBinomialHeap<T>,
    ) {}
}

type SkewBinomialHeap<T> = List<Tree<T>>;

const EmptySkewHeap = <SkewBinomialHeap<any>>EmptyList;

const link = <T>(T1: Tree<T>, T2: Tree<T>): Tree<T> =>
    (leq(T1.root, T2.root) ?
        new Tree(
            T1.rank + 1,
            T1.root,
            T1.values,
            cons(T2, T1.children))
    : new Tree(
        T2.rank + 1,
        T2.root,
        T2.values,
        cons(T1, T2.children)));

const skewLink = <T>(x: T, T1: Tree<T>, T2: Tree<T>): Tree<T> => {
    let linked = link(T1, T2);
    if (leq(x, linked.root))
        return new Tree(
            linked.rank,
            x,
            cons(linked.root, linked.values),
            linked.children);
    return new Tree(
        linked.rank,
        linked.root,
        cons(x, linked.values),
        linked.children);
};

const insTree = <T>(Tr: Tree<T>, H: SkewBinomialHeap<T>) =>
    (isEmptyList(H) ?
        cons(Tr, EmptySkewHeap)
    : (less(Tr.rank, H.head.rank) ?
        cons(Tr, H)
    : cons(link(Tr, H.head), H.tail)));

const mergeTrees = <T>(
    H1: SkewBinomialHeap<T>,
    H2: SkewBinomialHeap<T>,
): SkewBinomialHeap<T> =>
    (isEmptyList(H1) ?
        H2
    : (isEmptyList(H2) ?
        H1
    : (less(H1.head.rank, H2.head.rank) ?
        cons(H1.head, mergeTrees(H1.tail, H2))
    : (less(H2.head.rank, H1.head.rank) ?
        cons(H2.head, mergeSkewHeaps(H1, H2.tail))
    : cons(link(H1.head, H2.head), mergeTrees(H1.tail, H2.tail))))));

const normalize = <T>(H: SkewBinomialHeap<T>): SkewBinomialHeap<T> =>
    (isEmptyList(H) ?
        EmptySkewHeap
    : insTree(H.head, H.tail));

const skewHeapInsert = <T>(x: T, H: SkewBinomialHeap<T>): SkewBinomialHeap<T> =>
    ((isEmptyList(H) ||
        isEmptyList(H.tail)) ?
        cons(new Tree(0, x, EmptyList, EmptySkewHeap), H)
    : ((!isEmptyList(H.tail)) &&
        equal(H.head.rank, H.tail.head.rank) ?
        cons(
            skewLink(
                x,
                H.head,
                H.tail.head),
            H.tail.tail)
    : cons(new Tree(0, x, EmptyList, EmptySkewHeap), H)));

const mergeSkewHeaps = <T>(
    H1: SkewBinomialHeap<T>,
    H2: SkewBinomialHeap<T>,
): SkewBinomialHeap<T> =>
    mergeTrees(
        normalize(H1),
        normalize(H2));

const removeMinTree = <T>(H: SkewBinomialHeap<T>): SkewBinomialHeap<T> => {
    if (isEmptyList(H))
        throw new Error('Empty');
    if (isEmptyList(H.tail))
        return H;
    let val = removeMinTree(H.tail);
    if (leq(H.head.root, val.head.root))
        return H;
    return cons(val.head, cons(H.head, val.tail));
};

const skewHeapFindMin = <T>(H: SkewBinomialHeap<T>): T => {
    if (isEmptyList(H))
        throw new Error('Empty');
    return removeMinTree(H).head.root;
};

const insertAll = <T>(
    xs: List<T>,
    H: SkewBinomialHeap<T>,
): SkewBinomialHeap<T> =>
    (isEmptyList(xs) ?
        H
    : insertAll(
        xs.tail,
        skewHeapInsert(xs.head, H)));

const skewHeapDeleteMin = <T>(H: SkewBinomialHeap<T>): SkewBinomialHeap<T> => {
    if (isEmptyList(H))
        throw new Error('Empty');
    let val = removeMinTree(H);
    return insertAll(
        val.head.values,
        mergeSkewHeaps(
            reverse(val.head.children),
            val.tail));
};

// Bootstrapped Heap implementation

type PrimHeap<T> = SkewBinomialHeap<BootstrappedHeap<T>>

export class BootstrappedHeap<T> {
    constructor(
        public readonly min: T,
        public readonly heap: PrimHeap<T>,
    ) {
        Object.freeze(this);
    }

    public less(h: BootstrappedHeap<T>): boolean {
        return less(this.min, h.min);
    }

    public equal(h: BootstrappedHeap<T>): boolean {
        return equal(this.min, h.min);
    }
}

export const EmptyHeap = <BootstrappedHeap<any>>null;

export const isEmptyHeap = (H: BootstrappedHeap<any>) => (H === EmptyHeap);

export const merge = <T>(
    H1: BootstrappedHeap<T>,
    H2: BootstrappedHeap<T>,
): BootstrappedHeap<T> =>
    (isEmptyHeap(H1) ?
        H2
    : (isEmptyHeap(H2) ?
        H1
    : (leq(H1.min, H2.min) ?
        new BootstrappedHeap(
            H1.min,
            skewHeapInsert(H2, H1.heap))
    : new BootstrappedHeap(
        H2.min,
        skewHeapInsert(H1, H2.heap)))));

export const insert = <T>(x: T, H: BootstrappedHeap<T>): BootstrappedHeap<T> =>
    merge(H, new BootstrappedHeap(x, EmptySkewHeap));

export const findMin = <T>(H: BootstrappedHeap<T>): T => {
    if (isEmptyHeap(H))
        throw new Error('EmptyHeap');
    return H.min;
};

export const deleteMin = <T>(H: BootstrappedHeap<T>): BootstrappedHeap <T> => {
    if(isEmptyHeap(H))
        throw new Error('EmptyHeap');
    if (isEmptyList(H.heap))
        return EmptyHeap;
    let h = skewHeapFindMin(H.heap);
    let p = skewHeapDeleteMin(H.heap);
    return new BootstrappedHeap(
        h.min,
        mergeSkewHeaps(h.heap, p));
};
