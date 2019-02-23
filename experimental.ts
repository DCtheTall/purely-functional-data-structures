/*

Experimental code for implementing a call stack in JS in order
to allow for recursion that is bounded by the working memory of
the process and not the JavaScript call stack.

There is some refactoring but so far this works for any tail call
recursions.

*/

const NULL = <any>Symbol('null'); // Need a unique symbol for null

type FrameRetValue<T> = T | StackFrame<T>;

type RecFunction<T> = (...args: any[]) => FrameRetValue<T>;

type FunctionThatRet<T> = (...args: any[]) => T;

const originalFunctionMap = new WeakMap<FunctionThatRet<any>, RecFunction<any>>();

class StackFrame<T> {
  private context: any;
  private parent: StackFrame<T>;
  private parentArgIndex: number;
  private numberOfPendingArguments: number;

  constructor(
    private readonly func: RecFunction<T>,
    private readonly args: any[],
  ) {
    this.args = args;
    this.context = NULL;
    this.parent = NULL;
    this.numberOfPendingArguments = 0;
    const L = this.args.length;
    for (let i = 0; i < L; i++) {
      const arg = this.args[i];
      if (arg instanceof StackFrame) {
        arg.parent = this;
        arg.parentArgIndex = i;
        this.numberOfPendingArguments++;
      }
    }
  }

  public static withContext<T>(thisArg: any, func: RecFunction<T>, ...args: any[]) {
    return new StackFrame<T>(func, args).setContext(thisArg);
  }

  private setContext(thisArg: any): StackFrame<T> {
    this.context = thisArg;
    return this;
  }

  public shouldDelayExecution(): boolean {
    return this.numberOfPendingArguments !== 0;
  }

  public pushUnevaluatedArgumentsTo(stack: StackFrame<T>[]): StackFrame<T>[] {
    const unevaluatedArgs: StackFrame<T>[] = [];
    const L = this.args.length;
    for (let i = 0; i < L; i++) {
      const arg = this.args[i];
      if (arg instanceof StackFrame) {
        stack.push(arg);
      }
    }
    return unevaluatedArgs;
  }

  public evaluate(): FrameRetValue<T> {
    const func = originalFunctionMap.get(this.func) || this.func;
    const result = func.apply(this.context, this.args);

    if (this.parent === NULL) {
      return result;
    }

    if (result instanceof StackFrame) {
      result.parent = this.parent;
      result.parentArgIndex = this.parentArgIndex
    } else {
      this.parent.numberOfPendingArguments--;
    }

    this.parent.args[this.parentArgIndex] = result;
    return NULL;
  }
}

export const call =
  <T>(func: RecFunction<T>, ...args: any[]): StackFrame<T> =>
    new StackFrame<T>(func, args);

export const callWithContext =
  <T>(thisArg: any, func: RecFunction<T>, ...args: any[]): StackFrame<T> =>
    StackFrame.withContext<T>(thisArg, func, args);

class CallStack<T> {
  private readonly frames: StackFrame<T>[];

  constructor(first: StackFrame<T>) {
    this.frames = [first];
  }

  public push(frame: StackFrame<T>) {
    this.frames.push(frame);
  }

  public evaluate(): T {
    let cur: StackFrame<T>;

    OUTER:
    while (this.frames.length !== 0) {
      cur = this.frames.pop();

      if (cur.shouldDelayExecution()) {
        this.frames.push(cur);
        cur.pushUnevaluatedArgumentsTo(this.frames);
        continue;
      }

      let result = cur.evaluate();
      while (result === NULL) {
        cur = this.frames.pop();
        if (cur.shouldDelayExecution()) {
          this.frames.push(cur);
          cur.pushUnevaluatedArgumentsTo(this.frames);
          continue OUTER;
        }
        result = cur.evaluate();
      }
      return <T>result;
    }
  }
}

export function recursive<T>(func: RecFunction<T>, thisArg: any = null): FunctionThatRet<T> {
  const recursiveFunction = <FunctionThatRet<T>>((...args: any[]): T => {
    const firstEval = func.apply(thisArg, args);
    if (!(firstEval instanceof StackFrame)) {
      return firstEval;
    }
    return new CallStack<T>(firstEval).evaluate();
  });
  originalFunctionMap.set(recursiveFunction, func);
  return recursiveFunction;
}

// Example functions

const add = (x: number, y: number) => x + y;

const fib = recursive((n: number) =>
  ((n === 1) || (n === 2) ? (n - 1)
  : call(add, call(fib, n - 1), call(fib, n - 2))));

const mult = (x: number, y: number) => x * y;

const fact = recursive((n: number) =>
  (n === 0 ? 1
  : call(mult, n, call(fact, n - 1))));

const naiveFib = (n: number) =>
  ((n === 1) || (n === 2) ? (n - 1)
  : add(naiveFib(n - 1), naiveFib(n - 2)));

const naiveFact = n => (n === 0 ? 1 : n * naiveFact(n - 1));

console.time('naive');
let o1 = naiveFib(30);
console.timeEnd('naive');

console.time('my code');
let o2 = fib(30);
console.timeEnd('my code');

console.log(o1, o2);