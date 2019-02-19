/*

Experimenting with different implementations of trampolining

Supports:
- self recursive functions.
- Recursing with different trampolined functions without stack overflow
- when recursive cases are function applications with the recursive call,
  e.g. binary tree insert.

Limitations so far:
- Only tail calls.
- Does not support when recursive call involves multiple calls to a recursive function
  e.g. balance = (T: AVLTreeNode) => call balance twice on children of T then rotate
  if necessary.

Need to test:
- Functions like unconsTree (see binary random access list) which use: let val = recursive call then uses it as
  arguments in a later application.

TODO:
- Extend EvaluationStack to a class which can receive either RecursiveCall or DelayedEvaluation
  and handles processing the next object in the stack for better separation of concerns.
- Create ExecutionFork class which can be pushed onto the stack for multiple execution traces
  and try to execute forks without function recursion.

*/

interface RecursiveFunction<T> {
  (...args: any[]): T | RecursiveCall<T> | DelayedEvaluation<T>;
  originalFunction?: RecursiveFunction<T>;
}

class RecursiveCall<T> {
  public readonly args;

  constructor(
    public readonly func: RecursiveFunction<T>,
    ...args: any[]
  ) {
    this.args = args;
  }
}

export function recurse<T>(func: RecursiveFunction<T>, ...args: any[]): RecursiveCall<T> {
  return new RecursiveCall<T>(func, ...args);
}

class DelayedEvaluation<T> {
  private nextExecution_;
  private args;

  constructor(
    public readonly func: RecursiveFunction<T>,
    ...args: any[]
  ) {
    args.forEach((arg: any) => {
      if (arg instanceof RecursiveCall || arg instanceof DelayedEvaluation) {
        this.nextExecution_ = <RecursiveCall<T> | DelayedEvaluation<T>>arg;
      }
    });
    this.args = args;
  }

  get nextExecution() {
    return this.nextExecution_;
  }

  public applyResult(thisArg: any, evaluatedRecursiveCall: T): T {
    return this.func.apply(thisArg, this.args.map((arg: any) => {
      if (arg instanceof RecursiveCall) {
        return evaluatedRecursiveCall;
      }
      return arg;
    }));
  }
}

interface FunctionThatReturns<T> {
  (...args: any[]): T;
  originalFunction?: RecursiveFunction<T>;
}

function isRecursiveCallOrDelayedEval(o: any): boolean {
  return (o instanceof RecursiveCall || o instanceof DelayedEvaluation)
}

export function evaluateAfterRecursion<T>(func: FunctionThatReturns<T>, ...args: any[]) {
  const delayedExecutions = args.filter(arg => isRecursiveCallOrDelayedEval(arg));
  if (1 !== delayedExecutions.length) {
    throw new Error(
      'evaluateAfterRecursion must have exactly one argument that '
      + 'is an invocation of either recurse or evaluateAfterRecursion.');
  }
  return new DelayedEvaluation(func, ...args);
}

type EvaluationStack<T> = Array<DelayedEvaluation<T>>;

export function trampoline<T>(func: RecursiveFunction<T>): FunctionThatReturns<T> {
  const returnVal = <FunctionThatReturns<T>>((...args: any[]) => {
    const stack = <EvaluationStack<T>>[];
    let res = func(...args);
    const emptyStack = () => {
      while (stack.length > 0) {
        res = stack.pop().applyResult(null, <T>res);
      }
    };

    while (isRecursiveCallOrDelayedEval(res)) {
      if (res instanceof RecursiveCall) {
        if (res.func.originalFunction) {
          res = res.func.originalFunction(...res.args);
          continue;
        }
        res = res.func(...res.args);
      } else {
        stack.push(<DelayedEvaluation<T>>res);
        res = (<DelayedEvaluation<T>>res).nextExecution;
      }
      if (!isRecursiveCallOrDelayedEval(res)) emptyStack();
    }
    emptyStack();
    return res;
  });
  returnVal.originalFunction = func;
  return returnVal;
}
