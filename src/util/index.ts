/*

Purely Functional Data Structures
=================================
Utility Script
--------------

Author: Dylan Cutler
Copyright 2019 Google Inc.

*/

export * from './lazy';

export const raise = (msg: string) => { throw new Error(msg) };

interface ComparableObj {
  less(other: Comparable): boolean;
  equals(other: Comparable): boolean;
}

export type Comparable = null | number | string | ComparableObj;

export const less = <T extends Comparable>(A: T, B: T): boolean =>
  ((A && (<ComparableObj>A).less &&
    (typeof (<ComparableObj>A) === 'function')) ?
      (<ComparableObj>A).less(B)
  : (A < B));

export const equal = <T>(A: T, B: T): boolean =>
  ((A && (<any>A).equals &&
    (typeof (<any>A).equals === 'function')) ?
      (<any>A).equals(B)
  : (A === B));

export const leq = <T extends Comparable>(A: T, B: T): boolean => (less(A, B) || equal(A, B));

export const geq = <T extends Comparable>(A: T, B: T): boolean => !less(A, B);

export const greater = <T extends Comparable>(A: T, B: T): boolean => (geq(A, B) && !equal(A, B));
