/*

Purely Functional Data Structures
=================================
Red-Black Tree
--------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

enum Color { RED, BLACK };

export class RedBlackTree<T> {
  constructor(
    public readonly color: Color,
    public readonly value: T,
    public readonly left: RedBlackTree<T>,
    public readonly right: RedBlackTree<T>,
  ) {
    Object.freeze(this);
  }
}
