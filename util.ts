const TAG = '_$$recursive$$__';

export namespace Util {
    interface RecursiveFunction extends Function {
        [TAG]?: boolean;
    }

    export function optRecurse(f: RecursiveFunction): RecursiveFunction {
        f[TAG] = true;
        return f
    }

    // Tail call optimization and lazy evaluation
    export const optimize = (f: RecursiveFunction): RecursiveFunction =>
        (...args: any[]) => {
            f = f(...args);
            while (typeof f === 'function' && f[TAG]) f = f();
            return f;
        };

    export type LazyFunction<T> = () => T;

    // Lazy evaluation takes advantage of JS closure for memoization
    export function lazy<T>(f: LazyFunction<T>): LazyFunction<T> {
        let cached: T = null;
        let helper = () => {
            console.log(cached ? 'reused' : 'evaluated');
            if (cached) return cached;
            return (cached = f());
        };
        return helper;
    }

    export const force = <T>(f: LazyFunction<T>): T => f();

    export const raise = (e: string) => { throw new Error(e) };
}

