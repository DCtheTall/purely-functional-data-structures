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

    export type LazyFunction<T> = () => T;

    // Lazy evaluation takes advantage of JS closure and delayed evaluation
    // using abstraction
    export function lazy<T>(f: LazyFunction<T>): LazyFunction<T> {
        console.log('called');
        let cached: T = null;
        return () => (cached || (cached = f()));
    };

    export const force = <T>(f: LazyFunction<T>): T => f();

    export const raise = (e: string) => { throw new Error(e) };
}
