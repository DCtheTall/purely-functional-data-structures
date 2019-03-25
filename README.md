# Purely Functional Data Structures
## TypeScript Implementation

---

## Overview

This library is a set of TypeScript implementations of the data structures
covered in Chris Okasaki's Book
[<i>Purely Functional Data Structures</i>](https://www.amazon.com/Purely-Functional-Data-Structures-Okasaki/dp/0521663504).

Each of the data structures in this library are persistent, which means that
you can still access the object's previous state after an operation. In other
words, all of the objects are immutable, and each operation on the data
structures are pure functions which do not mutate their arguments.

Even with persistence, some data structures (such as the `RealTimeQueue`, `RealTimeDeque`, and
`SkewBinomialHeap`) are able to match or even outperform their imperative counterparts.

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
