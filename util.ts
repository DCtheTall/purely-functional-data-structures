export namespace Util {
    interface RecursiveFunction extends Function {
        '__$$recursive$$__'?: boolean;
    }

    export const raise = (e: string) => { throw new Error(e) };

    export function optRecurse(f: RecursiveFunction): RecursiveFunction {
        f['_$$recursive$$__'] = true;
        return () => f();
    }

    // Tail call optimization
    export const tailOpt = (f: RecursiveFunction): RecursiveFunction =>
        (...args: any[]) => {
            f = f(...args);
            while (typeof f === 'function' && f['_$$recursive$$__']) f = f();
            return f;
        };
}

