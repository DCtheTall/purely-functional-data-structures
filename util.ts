const TAG = '_$$recursive$$__';

export namespace Util {
    type FunctionThatReturns<T> = (...args: any[]) => (T | FunctionThatReturns<T>);

    interface RecursiveFunction<T> extends FunctionThatReturns<T> {
        [TAG]?: boolean;
    }

    export const optRecurse = <T>(f: RecursiveFunction<T>): RecursiveFunction<T> => {
        f[TAG] = true;
        return f
    }

    // Tail call optimization and lazy evaluation using a delayed
    // evaluation scheme
    export const optimize = <T>(f: RecursiveFunction<T>): RecursiveFunction<T> =>
        (...args: any[]): T => {
            let tmp = f(...args);
            while (typeof f === 'function' && f[TAG]) {
                tmp = (<RecursiveFunction<T>>tmp)();
            }
            return <T>(tmp); // force the type
        };

    export type LazyFunction<T> = () => T;

    // Lazy evaluation takes advantage of JS closure and delayed evaluation
    // using abstraction
    export function lazy<T>(f: LazyFunction<T>): LazyFunction<T> {
        let cached: T = null;
        return () => (cached || (cached = f()));
    }

    export const force = <T>(f: LazyFunction<T>): T => f();

    export const raise = (e: string) => { throw new Error(e) };
}

