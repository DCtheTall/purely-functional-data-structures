/*

Experimental code for implementing a call stack in JS in order
to allow for recursion that is bounded by the working memory of
the process and not the JavaScript call stack.

There is some refactoring but so far this works for any tail call
recursions.

*/

type FrameReturnValue<T> = T | StackFrame<T>;

interface RecursiveFunction<T> {
  (...args: any[]): FrameReturnValue<T>;
  originalFunction?: RecursiveFunction<T>;
}

type VoidFunctionOf<T> = (_: T) => void;

class StackFrame<T> {
  public readonly args: any[];
  private sendEvaluatedResult: VoidFunctionOf<T>;
  private numberOfPendingArguments: number;

  constructor(
    private readonly func: RecursiveFunction<T>,
    ...args: any[]
  ) {
    this.args = args;
    this.numberOfPendingArguments = 0;
    args.forEach((arg: any, i: number) => {
      if (arg instanceof StackFrame) {
        this.numberOfPendingArguments++;
        // TODO instead of creating fn, use a pointer to the which argument array slot to overwrite
        arg.setSendEvaluatedResult((result: FrameReturnValue<T>) => {
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

  public applyResultsToFunction(thisArg: any): FrameReturnValue<T> {
    const func = this.func.originalFunction || this.func;
    const result = func.apply(thisArg, this.args);
    if (this.sendEvaluatedResult !== undefined) {
      this.sendEvaluatedResult(result);
      return null;
    }
    return result;
  }
}

export function call<T>(
  func: RecursiveFunction<T>,
  ...args: any[]
): StackFrame<T> {
  return new StackFrame<T>(func, ...args);
}

class CallStack<T> {
  private readonly frames: StackFrame<T>[];

  constructor(first: StackFrame<T>) {
    this.frames = [first];
  }

  public push(frame: StackFrame<T>) {
    this.frames.push(frame);
  }

  public evaluate(thisArg: any = null): T {
    let cur: FrameReturnValue<T>;
    OUTER:
    while (this.frames.length !== 0) {
      cur = this.frames.pop();
      if (cur.shouldDelayExecution()) {
        const unevaluatedArgs = cur.getUnevaluatedArguments();
        this.frames.push(cur, ...unevaluatedArgs);
        continue;
      }
      let evaluated = cur.applyResultsToFunction(thisArg);
      while (evaluated === null) {
        cur = this.frames.pop();
        if (cur.shouldDelayExecution()) {
          this.frames.push(cur);
          continue OUTER;
        }
        evaluated = cur.applyResultsToFunction(thisArg);
      }
      return <T>evaluated;
    }
  }
}

interface FunctionThatReturns<T> {
  (...args: any[]): T;
  originalFunction?: RecursiveFunction<T>;
}

export function recursive<T>(
  func: RecursiveFunction<T>,
  thisArg: any = null,
): FunctionThatReturns<T> {
  const recursiveFunction = <FunctionThatReturns<T>>((...args: any[]): T => {
    const firstEval = func(...args);
    if (!(firstEval instanceof StackFrame)) return firstEval;
    const stack = new CallStack<T>(firstEval);
    return stack.evaluate(thisArg);
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


  const naiveFib = (n: number) => ((n === 1) || (n === 2) ? (n - 1)
  : fib(n - 1) + fib(n - 2));
  console.time('naive');
  let o1 = naiveFib(30);
  console.timeEnd('naive');

  console.time('my code');
  let o2 = fib(30);
  console.timeEnd('my code');

  console.log(o1, o2);