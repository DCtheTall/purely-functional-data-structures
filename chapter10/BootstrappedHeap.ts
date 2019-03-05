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

// Static implements decorator

const staticImplements = <T>() => (_: T) => {};

// Abstract heap signature for a heap instance of type T

interface Heap<Instance, T> {
    new(...args: any[]): Instance;
    Empty: Instance;
    isEmpty(H: Instance): boolean;
    insert(x: T, H: Instance): Instance;
    merge(H1: Instance, H2: Instance): Instance;
    findMin(H: Instance): T;
    deleteMin(H: Instance): Instance;
}

// Basic list implementation.

class List<T> {
    constructor(
        public readonly head: T,
        public readonly tail: List<T>,
    ) {}

    public static get Empty() {
        return <List<any>>null;
    }

    public static isEmpty(L: List<any>): boolean {
        return L === List.Empty;
    }

    public static cons<T>(x: T, L: List<T>) {
        return new List(x, L);
    }

    public static reverse<T>(L: List<T>): List<T> {
        let helper = (L: List<T>, R: List<T>) => {
            if (List.isEmpty(L))
                return R;
            return helper(L.tail, List.cons(L.head, R));
        }
        return helper(L, List.Empty);
    }
}

// Heap implementation

interface SkewBinomialHeapInstance<T> {
    head: Tree<T>;
    tail: SkewBinomialHeapInstance<T>;
}

class Tree<T> {
    constructor(
        public readonly rank: number,
        public readonly root: T,
        public readonly values: List<T>,
        public readonly children: SkewBinomialHeap<T>,
    ) {}

    public static create<T>(
        rank: number,
        root: T,
        elems: List<T>,
        children: SkewBinomialHeap<T>,
    ) {
        return new Tree(rank, root, elems, children);
    }
}

// Ideally this would extend the List type if List was implemented
// the same way. That way we get Empty, isEmpty(), create() for free.
@staticImplements<Heap<SkewBinomialHeapInstance<T>, T>>()
class SkewBinomialHeap<T> extends List<Tree<T>> {
    constructor(
        public readonly head: Tree<T>,
        public readonly tail: SkewBinomialHeap<T>,
    ) {
        super(head, tail);
    }

    public static get Empty(): SkewBinomialHeap<any> {
        return <SkewBinomialHeap<any>>null;
    }

    private static create<T>(x: Tree<T>, h: SkewBinomialHeap<T>) {
        return new SkewBinomialHeap(x, h);
    }

    private static link<T>(T1: Tree<T>, T2: Tree<T>): Tree<T> {
        if (leq(T1.root, T2.root))
            return Tree.create(
                T1.rank + 1,
                T1.root,
                T1.values,
                SkewBinomialHeap.create(T2, T1.children));
        return Tree.create(
            T2.rank + 1,
            T2.root,
            T2.values,
            SkewBinomialHeap.create(T1, T2.children));
    }

    private static skewLink<T>(x: T, T1: Tree<T>, T2: Tree<T>): Tree<T> {
        let linked = SkewBinomialHeap.link(T1, T2);
        if (leq(x, linked.root))
            return Tree.create(
                linked.rank,
                x,
                List.cons(linked.root, linked.values),
                linked.children);
        return Tree.create(
            linked.rank,
            linked.root,
            List.cons(x, linked.values),
            linked.children);
    }

    private static insTree<T>(
        Tr: Tree<T>,
        H: SkewBinomialHeap<T>,
    ): SkewBinomialHeap<T> {
        if (SkewBinomialHeap.isEmpty(H))
            return SkewBinomialHeap.create(
                Tr,
                SkewBinomialHeap.Empty);
        if (less(Tr.rank, H.head.rank))
            return SkewBinomialHeap.create(Tr, H);
        return SkewBinomialHeap.create(
            SkewBinomialHeap.link(Tr, H.head), H.tail);
    }

    private static mergeTrees<T>(
        H1: SkewBinomialHeap<T>,
        H2: SkewBinomialHeap<T>,
    ): SkewBinomialHeap<T> {
        if (SkewBinomialHeap.isEmpty(H1))
            return H2;
        if (SkewBinomialHeap.isEmpty(H2))
            return H1;
        if (less(H1.head.rank, H2.head.rank))
            return SkewBinomialHeap.create(
                H1.head,
                SkewBinomialHeap.mergeTrees(H1.tail, H2));
        if (less(H2.head.rank, H1.head.rank))
            return SkewBinomialHeap.create(
                H2.head,
                SkewBinomialHeap.merge(H1, H2.tail));
        return SkewBinomialHeap.create(
            SkewBinomialHeap.link(H1.head, H2.head),
            SkewBinomialHeap.mergeTrees(H1.tail, H2.tail));
    }

    private static normalize<T>(H: SkewBinomialHeap<T>): SkewBinomialHeap<T> {
        if (SkewBinomialHeap.isEmpty(H))
            return <SkewBinomialHeap<T>>SkewBinomialHeap.Empty
        return SkewBinomialHeap.insTree(H.head, H.tail);
    }

    public static insert<T>(x: T, H: SkewBinomialHeap<T>): SkewBinomialHeap<T> {
        if (SkewBinomialHeap.isEmpty(H) ||
            SkewBinomialHeap.isEmpty(H.tail))
                return SkewBinomialHeap.create(
                    Tree.create(
                        0,
                        x,
                        List.Empty,
                        <SkewBinomialHeap<T>>SkewBinomialHeap.Empty),
                    H);
        if ((!SkewBinomialHeap.isEmpty(H.tail)) &&
            equal(H.head.rank, H.tail.head.rank))
                return SkewBinomialHeap.create(
                    SkewBinomialHeap.skewLink(
                        x,
                        H.head,
                        H.tail.head),
                    H.tail.tail);
        return SkewBinomialHeap.create(
            Tree.create(
                0,
                x,
                List.Empty,
                <SkewBinomialHeap<T>>SkewBinomialHeap.Empty),
            H);
    }

    public static merge<T>(
        H1: SkewBinomialHeap<T>,
        H2: SkewBinomialHeap<T>,
    ): SkewBinomialHeap<T> {
        return SkewBinomialHeap.mergeTrees(
            SkewBinomialHeap.normalize(H1),
            SkewBinomialHeap.normalize(H2));
    }

    // Returns a heap whose head is the tree with the smallest root.
    private static removeMinTree<T>(H: SkewBinomialHeap<T>): SkewBinomialHeap<T> {
        if (SkewBinomialHeap.isEmpty(H))
            throw new Error('Empty');
        if (SkewBinomialHeap.isEmpty(H.tail))
            return H;
        let val = SkewBinomialHeap.removeMinTree(H.tail);
        if (leq(H.head.root, val.head.root))
            return H;
        return SkewBinomialHeap.create(
            val.head,
            SkewBinomialHeap.create(H.head, val.tail));
    }

    public static findMin<T>(H: SkewBinomialHeap<T>): T {
        if (SkewBinomialHeap.isEmpty(H))
            throw new Error('Empty');
        return SkewBinomialHeap.removeMinTree(H).head.root;
    }

    private static insertAll<T>(
        xs: List<T>,
        H: SkewBinomialHeap<T>,
    ): SkewBinomialHeap<T> {
        if (List.isEmpty(xs))
            return H;
        return SkewBinomialHeap.insertAll(
            xs.tail,
            SkewBinomialHeap.insert(xs.head, H));
    }

    private static rev<T>(L: SkewBinomialHeap<T>): SkewBinomialHeap<T> {
        let helper = (
            L: SkewBinomialHeap<T>,
            R: SkewBinomialHeap<T>,
        ) => {
            if (List.isEmpty(L))
                return R;
            return helper(L.tail, SkewBinomialHeap.create(L.head, R));
        }
        return helper(L, SkewBinomialHeap.Empty);
    }

    public static deleteMin<T>(H: SkewBinomialHeap<T>): SkewBinomialHeap<T> {
        if (SkewBinomialHeap.isEmpty(H))
            throw new Error('Empty');
        let val = SkewBinomialHeap.removeMinTree(H);
        return SkewBinomialHeap.insertAll(
            val.head.values,
            SkewBinomialHeap.merge(
                SkewBinomialHeap.rev(val.head.children),
                val.tail));
    }
}

// Bootstrapped heap implementation

interface BootstrappedHeapInstance<T> {
    less: (h: BootstrappedHeapInstance<T>) => boolean;
    equal: (h: BootstrappedHeapInstance<T>) => boolean;
    min: T;
    heap: PrimHeap<T>;
}

type PrimHeap<T> = SkewBinomialHeap<BootstrappedHeap<T>>

@staticImplements<Heap<BootstrappedHeapInstance<T>, T>>()
class BootstrappedHeap<T> {
    constructor(
        public readonly min: T,
        public readonly heap: PrimHeap<T>,
    ) {
        Object.freeze(this);
    }

    public less(h: BootstrappedHeapInstance<T>): boolean {
        return less(this.min, h.min);
    }

    public equal(h: BootstrappedHeapInstance<T>): boolean {
        return equal(this.min, h.min);
    }

    public static get Empty() {
        return <BootstrappedHeap<any>>null;
    }

    public static isEmpty(H: BootstrappedHeap<any>): boolean {
        return H === BootstrappedHeap.Empty;
    }

    public static create<T>(min: T, heap: PrimHeap<T>): BootstrappedHeap<T> {
        return new BootstrappedHeap(min, heap);
    }

    public static merge<T>(
        H1: BootstrappedHeap<T>,
        H2: BootstrappedHeap<T>,
    ): BootstrappedHeap<T> {
        if (BootstrappedHeap.isEmpty(H1))
            return H2;
        if (BootstrappedHeap.isEmpty(H2))
            return H1;
        if (leq(H1.min, H2.min))
            return BootstrappedHeap.create(
                H1.min,
                SkewBinomialHeap.insert(H2, H1.heap))
    }

    public static insert<T>(x: T, H: BootstrappedHeap<T>): BootstrappedHeap<T> {
        return BootstrappedHeap.merge(
            H,
            BootstrappedHeap.create(x, SkewBinomialHeap.Empty));
    }

    public static findMin<T>(H: BootstrappedHeap<T>): T {
        if (BootstrappedHeap.isEmpty(H))
            throw new Error('Empty');
        return H.min;
    }

    public static deleteMin<T>(H: BootstrappedHeap<T>): BootstrappedHeap<T> {
        if (BootstrappedHeap.isEmpty(H))
            throw new Error('Empty');
        if (SkewBinomialHeap.isEmpty(H.heap))
            return BootstrappedHeap.Empty;
        let h = SkewBinomialHeap.findMin(H.heap);
        let p = SkewBinomialHeap.deleteMin(H.heap);
        return BootstrappedHeap.create(
            h.min,
            SkewBinomialHeap.merge(h.heap, p));
    }
}
