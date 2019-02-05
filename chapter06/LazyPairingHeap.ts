/*

LazyPairingHeap data structure
uses lazy evaluation to cope with persistence.
Runtime is the same as the pairing heap in chapter
5, but the analysis in chapter 5 ignored persistence.

*/

import { Util } from '../util';

export namespace LazyPairingHeap {
    export type Heap<T> = (f: Selector<T>) => (T | Heap<T> | SuspendedHeap<T>);

    type SuspendedHeap<T> = Util.LazyFunction<Heap<T>>;

    type Selector<T> = (e: T, odd: Heap<T>, children: SuspendedHeap<T>) =>
        (T | Heap<T> | SuspendedHeap<T>);

    export const EmptyHeap = <Heap<any>>null;

    export const isEmpty = <T>(H: Heap<T>) => (H === null);

    export const findMin = <T>(H: Heap<T>) =>
        (isEmpty(H) ? Util.raise('Empty')
        : <T>H((e, o, c) => e));

    const oddField = <T>(H: Heap<T>) => <Heap<T>>H((e, o, c) => o);

    const children = <T>(H: Heap<T>) => <SuspendedHeap<T>>H((e, o, c) => c);

    const createHeap = <T>(e: T, odd: Heap<T>, ch: SuspendedHeap<T>) =>
        <SuspendedHeap<T>>(H => H(e, odd, ch));

    const merge = <T>(A: Heap<T>, B: Heap<T>): Heap<T> =>
        (isEmpty(A) ? B
        : (isEmpty(B) ? A
        : (findMin(A) <= findMin(B) ?
            link(A, B)
        : link(B, A))));

    const link = <T>(A: Heap<T>, B: Heap<T>): Heap<T> =>
        (isEmpty(oddField(A)) ?
            createHeap(findMin(A), B, children(A))
        : createHeap(
            findMin(A),
            EmptyHeap,
            Util.lazy(() =>
                merge(merge(oddField(A), B), Util.force(children(A))))));

    export const deleteMin = <T>(H: Heap<T>) =>
        (isEmpty(H) ? Util.raise('Empty')
        : merge(oddField(H), Util.force(children(H))));
}