const TAG = '_$$recursive$$__';

export namespace Util {

    interface RecursiveFunction extends Function {
        [TAG]?: boolean;
    }

    export function optRecurse(f: RecursiveFunction): RecursiveFunction {
        f[TAG] = true;
        return f
    }

    // Tail call optimization
    export const tailOpt = (f: RecursiveFunction): RecursiveFunction =>
        (...args: any[]) => {
            f = f(...args);
            while (typeof f === 'function' && f[TAG]) f = f();
            return f;
        };

    export const raise = (e: string) => { throw new Error(e) };
}

