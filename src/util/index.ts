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

export const less = <T>(A: T, B: T): boolean =>
  ((A && (<any>A).less &&
    (typeof (<any>A).less === 'function')) ?
      (<any>A).less(B)
  : (A < B));

export const equal = <T>(A: T, B: T): boolean =>
  ((A && (<any>A).eq &&
    (typeof (<any>A).eq === 'function')) ?
      (<any>A).eq(B)
  : (A === B));

export const leq = <T>(A: T, B: T): boolean => (less(A, B) || equal(A, B));

export const geq = <T>(A: T, B: T): boolean => !less(A, B);

export const greater = <T>(A: T, B: T): boolean => (geq(A, B) && !equal(A, B));
