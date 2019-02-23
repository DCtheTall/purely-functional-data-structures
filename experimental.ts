/*

Experimental code for implementing a call stack in JS in order
to allow for recursion that is bounded by the working memory of
the process and not the JavaScript call stack.

There is some refactoring but so far this works for any tail call
recursions.

*/

type FrameRetValue<T> = T | StackFrame<T>;

interface RecursiveFunction<T> {
  (...args: any[]): FrameRetValue<T>;
  originalFunction?: RecursiveFunction<T>;
}

interface FunctionThatReturns<T> {
  (...args: any[]): T;
  originalFunction?: RecursiveFunction<T>;
}

type VoidFunctionOf<T> = (_: T) => void;

class StackFrame<T> {
  private sendEvaluatedResult: VoidFunctionOf<T>;
  private numberOfPendingArguments: number;
  private context: any;

  constructor(
    private readonly func: RecursiveFunction<T>,
    public readonly args: any[]
  ) {
    this.args = args;
    this.numberOfPendingArguments = 0;
    args.forEach((arg: any, i: number) => {
      if (arg instanceof StackFrame) {
        this.numberOfPendingArguments++;
        // TODO instead of creating fn, use a pointer to the which argument array slot to overwrite
        arg.setSendEvaluatedResult((result: FrameRetValue<T>) => {
          this.args[i] = result;
          if (result instanceof StackFrame) {
            result.setSendEvaluatedResult(arg.sendEvaluatedResult);
          } else {
            this.numberOfPendingArguments--;
          }
        });
      }
    });
  }

  public static withContext<T>(thisArg: any, func, ...args: any[]) {
    return new StackFrame<T>(func, args).setContext(thisArg);
  }

  private setContext(thisArg: any): StackFrame<T> {
    this.context = thisArg;
    return this;
  }

  // TODO refactor using parent pointer instead of creating a function for this
  private setSendEvaluatedResult(func: VoidFunctionOf<T>) {
    this.sendEvaluatedResult = func;
  }

  public shouldDelayExecution(): boolean {
    return this.numberOfPendingArguments !== 0;
  }

  public getUnevaluatedArguments(): StackFrame<T>[] {
    // TODO refactor into defined fn and use bind in constructor
    const unevaluatedArgs: StackFrame<T>[] = [];
    for (const arg of this.args) {
      if (arg instanceof StackFrame) {
        unevaluatedArgs.push(arg);
      }
    }
    return unevaluatedArgs;
  }

  public applyResultsToFunction(): FrameRetValue<T> {
    const func = this.func.originalFunction || this.func;
    const result = func.apply(this.context, this.args);
    if (this.sendEvaluatedResult !== undefined) {
      this.sendEvaluatedResult(result);
      return null;
    }
    return result;
  }
}

export const call =
  <T>(func: RecursiveFunction<T>, ...args: any[]): StackFrame<T> =>
    new StackFrame<T>(func, args);

export const callWithContext =
  <T>(thisArg: any, func: RecursiveFunction<T>, ...args: any[]): StackFrame<T> =>
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
    let cur: FrameRetValue<T>;
    OUTER:
    while (this.frames.length !== 0) {
      cur = this.frames.pop();
      if (cur.shouldDelayExecution()) {
        const unevaluatedArgs = cur.getUnevaluatedArguments();
        this.frames.push(cur);
        this.frames.push.apply(this.frames, unevaluatedArgs);
        continue;
      }
      let evaluated = cur.applyResultsToFunction();
      while (evaluated === null) {
        cur = this.frames.pop();
        if (cur.shouldDelayExecution()) {
          this.frames.push(cur);
          continue OUTER;
        }
        evaluated = cur.applyResultsToFunction();
      }
      return <T>evaluated;
    }
  }
}

export function recursive<T>(func: RecursiveFunction<T>, thisArg: any = null): FunctionThatReturns<T> {
  const recursiveFunction = <FunctionThatReturns<T>>((...args: any[]): T => {
    const firstEval = func.apply(thisArg, args);
    if (!(firstEval instanceof StackFrame)) {
      return firstEval;
    }
    return new CallStack<T>(firstEval).evaluate();
  });
  recursiveFunction.originalFunction = func;
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
    ((n === 1) || (n === 2) ?
      (n - 1)
    : add(fib(n - 1), fib(n - 2)));
  console.time('naive');
  let o1 = naiveFib(32);
  console.timeEnd('naive');

  console.time('my code');
  let o2 = fib(32);
  console.timeEnd('my code');

  console.log(o1, o2);