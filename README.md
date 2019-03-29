# Purely Functional Data Structures
## TypeScript Implementation

---

## Overview

This library is a set of TypeScript implementations of the data structures
covered in Chris Okasaki's Book
[<i>Purely Functional Data Structures</i>](https://www.amazon.com/Purely-Functional-Data-Structures-Okasaki/dp/0521663504).

A functional data structure is a structure where operations can only be comprised of
[pure functions](https://en.wikipedia.org/wiki/Pure_function). This gives the structures the property of persistence,
for example. Say you want to use a heap from this library:

```ts
import { deleteMin, insert, Heap, EmptyHeap, isEmpty } from './src/BinomialHeap.ts';

let H = <Heap<number>>EmptyHeap;
let H1 = insert(1, H);

console.log(isEmpty(H));  // true
console.log(isEmpty(H1));  // false
```

this means that each state of the structure remains until it is garbage collected.

```ts
console.log(isEmpty(deleteMin(H1)));  // true
console.log(isEmpty(H1));  // false

H = insert(1, insert(2, H));
console.log(isEmpty(H));  // false
```

In other words, all of the objects are immutable, and each operation on the data
structures are pure functions which do not mutate their arguments.

Even with persistence, some data structures (such as the `RealTimeQueue`, `RealTimeDeque`, and
`SkewBinomialHeap`) are able to match or even outperform their imperative counterparts.

## Usage

### Installation

For now, in order to use this in a TypeScript app, you should clone the repository at its latest release into your app. For now this package is not on npm since it has no `"main"` field in its `package.json`.

### Comparable types

This library supports abitrary types to go into containers. Some containers require that their elements extend the following type in order to work:

```ts
interface ComparableObj {
  less(other: Comparable): boolean;
  equals(other: Comparable): boolean;
}

type Comparable = null | string | number | ComparableObj;
```

---

## Data Structures in This Library

### Deques

- `BankersDeque.ts`
- `CatenableDeque.ts`
- `Deque.ts`
- `RealTimeDeque.ts`
- `SimpleCatenableDeque.ts`

### Heaps

- `BinaryPairingHeap.ts`
- `BinomialHeap.ts`
- `BootstrappedHeap.ts`
- `LazyBinomialHeap.ts`
- `LazyPairingHeap.ts`
- `LeftistHeap.ts`
- `PairingHeap.ts`
- `ScheduledBinomialHeap.ts`
- `SkewBinomialHeap.ts`
- `SplayHeap.ts`

### Lists

- `AltBinaryRandomAccessList.ts`
- `BinaryRandomAccessList.ts`
- `CatenableList.ts`
- `List.ts`
- `SkewBinaryRandomAccessList.ts`
- `SparseBinaryRandomAccessList.ts`
- `Stream.ts`
- `ZerolessBinaryRandomAccessList.ts`

### Maps

- `FiniteMap.ts`
- `Trie.ts`

### Mergesort

- `BottomUpMergesort.ts`
- `ScheduledBottomUpMergesort.ts`

### Numerical Representations

- `DenseBinaryNumber.ts`
- `LazyBinaryNumber.ts`
- `NaturalNumber.ts`
- `SegmentedBinaryNumber.ts`
- `SkewBinaryNumber.ts`
- `ZerolessBinaryNumber.ts`

### Trees

- `BinaryTree.ts`
- `RedBlackTree.ts`

### Queues

- `BankersQueue.ts`
- `BatchedQueue.ts`
- `BootstrappedQueue.ts`
- `HoodMelvilleQueue.ts`
- `ImplicitQueue.ts`
- `PhysicistsQueue.ts`
- `RealTimeQueue.ts`
