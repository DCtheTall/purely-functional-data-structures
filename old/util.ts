const TAG = '_$$recursive$$__';

export namespace Util {
    type FunctionThatReturns<T> = (...args: any[]) => (T | FunctionThatReturns<T>);

    interface RecursiveFunction<T> extends FunctionThatReturns<T> {
        [TAG]?: boolean;
    };

    export const trampoline = <T>(func: FunctionThatReturns<T>) =>
        (...args: any[]): T => {
            let f = <T | RecursiveFunction<T>>func.apply(null, args);
            while (f[TAG]) {
                f = (<RecursiveFunction<T>>f)();
            }
            return <T>f;
        }

    // TODO implement key with Symbols if possible
    export const recurseOn = <T>(f: RecursiveFunction<T>): RecursiveFunction<T> => {
        f[TAG] = true;
        return f;
    };

    // IDEA: Would this be better if it used promises instead of generic types
    // a lazy function is an async function that returns a promise which delays
    // the evaluation of a function. Forcing the lazy expression is awaiting
    // the promise.

    export type Suspension<T> = () => T;

    // Lazy evaluation takes advantage of JS closure and delayed evaluation
    // using abstraction
    export function $<T>(f: Suspension<T>): Suspension<T> {
        let cached: T = null;
        return () => (cached || (cached = f()));
    };

    // TODO refactor using lazy curry function
    // export const lazy = <T>(f: FunctionThatReturns<T>) =>
    //     (<FunctionThatReturns<Suspension<T>>>
    //         ((...args: any[]) => lazyEval(() => f(...args))));

    export const force = <T>(f: Suspension<T>): T => f();

    export const raise = (e: string) => { throw new Error(e) };
}
