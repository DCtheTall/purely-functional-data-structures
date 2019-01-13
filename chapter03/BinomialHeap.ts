/*

Functional binomial heap implementation

*/

import { List } from '../chapter02/List';

export namespace BinomialHeap {
    type Node<T> = (f: Selector<T>) => (number | T | List.List<Node<T>>);

    type Selector<T> = (rank: number, value: T, children: List.List<Node<T>>) =>
        (number | T | List.List<Node<T>>);

    const rank = <T>(t: Node<T>) => <number>t((r, v, c) => r);

    const valueof = <T>(t: Node<T>) => <T>t((r, v, c) => v);

    const children = <T>(t: Node<T>) => <List.List<Node<T>>>t((r, v, c) => c);

    // Link two nodes of equal rank
    // const link = <T>(a: Node<T>, b: Node<T>)
}
