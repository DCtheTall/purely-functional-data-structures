/*

Implementation of a binary random access list based
on skew binomial numbers. This can be used instead of a
regular list for HoodMelvilleQueues to allow operations
like insert() and update() in logarithmic time.

*/

import { List } from '../chapter02/List';
import { Util } from '../util';

export namespace SkewBinaryRandomAccessList {
    enum NodeLabels { LEAF, NODE };

    type Node<T> = (f: NodeSelector<T> | LeafSelector<T>) => (NodeLabels | T | Node<T>);

    type NodeSelector<T> =
        (lbl: NodeLabels, val: T, lft: Node<T>, rt: Node<T>) =>
            (NodeLabels | T | Node<T>);

    type LeafSelector<T> = (lbl: NodeLabels, val: T) => (NodeLabels | T);

    const label = (n: Node<any>) => <NodeLabels>n((lbl, val) => lbl);

    const valueof = <T>(n: Node<T>) => <T>n((lbl, val) => val);

    const left = <T>(n: Node<T>) => <Node<T>>n((lbl, val, lft, rt) => lft);

    const right = <T>(n: Node<T>) => <Node<T>>n((lbl, val, lft, rt) => rt);

    type Element<T> = (f: ElementSelector<T>) => (number | Node<T>);

    type ElementSelector<T> = (w: number, n: Node<T>) => (number | Node<T>);

    const size = (E: Element<any>) => <number>E((w, n) => w);

    const tree = <T>(E: Element<T>) => <Node<T>>E((w, n) => n);

    export type RList<T> = List.List<Element<T>>;

    export const EmptyRList = <RList<any>>List.EmptyList;
}
