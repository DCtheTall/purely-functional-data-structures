/*

Experimental code for implementing a call stack in JS in order
to allow for recursion that is bounded by the working memory of
the process and not the JavaScript call stack.

There is some refactoring but so far this works for any tail call
recursions.

*/

type FrameRetValue<T> = T | StackFrame<T>;

type RecFunction<T> = (...args: any[]) => FrameRetValue<T>;

type FunctionThatRet<T> = (...args: any[]) => T;

type VoidFunctionOf<T> = (_: T) => void;

const originalFunctionMap = new WeakMap<FunctionThatRet<any>, RecFunction<any>>();

class StackFrame<T> {
  public readonly args: any[];
  private sendEvaluatedResult: VoidFunctionOf<T>;
  private numberOfPendingArguments: number;
  private context: any;

  constructor(
    private readonly func: RecFunction<T>,
    ...args: any[]
  ) {
    this.args = args;
    this.numberOfPendingArguments = 0;
    this.context = null;
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

  // TODO refactor using parent pointer instead of creating a function for this
  private setSendEvaluatedResult(func: VoidFunctionOf<T>) {
    this.sendEvaluatedResult = func;
  }

  public shouldDelayExecution(): boolean {
    return this.numberOfPendingArguments !== 0;
  }

  public getUnevaluatedArguments(): StackFrame<T>[] {
    const unevaluatedArgs: StackFrame<T>[] = [];
    for (const arg of this.args) {
      if (arg instanceof StackFrame) {
        unevaluatedArgs.push(arg);
      }
    }
    return unevaluatedArgs;
  }

  public applyEvaluatedResultsToFunction(): FrameRetValue<T> {
    const func = originalFunctionMap.get(this.func) || this.func;
    const result = func.apply(this.context, this.args);
    if (this.sendEvaluatedResult !== undefined) {
      this.sendEvaluatedResult(result);
      return null;
    }
    return result;
  }

  private setContext(thisArg: any): StackFrame<T> {
    this.context = thisArg;
    return this;
  }

  public static withContext<T>(
    thisArg: any, func: RecFunction<T>, ...args: any[]): StackFrame<T> {
    return new StackFrame(func, ...args).setContext(thisArg);
  }
}

export const call =
  <T>(func: RecFunction<T>, ...args: any[]): StackFrame<T> =>
    new StackFrame<T>(func, ...args);

export const callWithContext =
  <T>(thisArg: any, func: RecFunction<T>, ...args: any[]): StackFrame<T> =>
    StackFrame.withContext(thisArg, func, ...args);

class CallStack<T> {
  private readonly frames: StackFrame<T>[];

  constructor(first: StackFrame<T>) {
    this.frames = [first];
  }

  public push(frame: StackFrame<T>) {
    this.frames.push(frame);
  }

  public evaluate(): T {
    let cur: StackFrame<T> = this.frames.pop();
    OUTER:
    while (this.frames.length !== 0) {
      if (!cur) cur = this.frames.pop();
      if (cur.shouldDelayExecution()) {
        const unevaluatedArgs = cur.getUnevaluatedArguments();
        this.frames.push(cur, ...unevaluatedArgs);
        cur = null;
        continue;
      }
      let evaluated = cur.applyEvaluatedResultsToFunction();
      while (evaluated === null) {
        cur = this.frames.pop();
        if (cur.shouldDelayExecution()) {
          continue OUTER;
        }
        evaluated = cur.applyEvaluatedResultsToFunction();
      }
      return <T>evaluated;
    }
  }
}

export function recursive<T>(func: RecFunction<T>): FunctionThatRet<T> {
  const recursiveFunction = <FunctionThatRet<T>>((...args: any[]): T => {
    const firstEval = func(...args);
    if (!(firstEval instanceof StackFrame)) return firstEval;
    const stack = new CallStack<T>(firstEval);
    return stack.evaluate();
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
