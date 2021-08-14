// Copyright (c) 2021 Magnus Meseck
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

type Awaited<T extends Object> = {
    [Property in keyof T]:
    T[Property] extends Function ? DePromisifiedReturnValue<T[Property]> :
    T[Property] extends Promise<infer V> ? V :
    DePromisified<T[Property]>; };

type DePromisified<T> = T extends Object ? Awaited<T> & Promise<T> : T;

type DePromisifiedReturnValue<T extends Function> =
    T extends (...args: infer A) => Promise<infer R> ? (...args: A) => DePromisified<R> :
    T extends (...args: infer A) => infer R ? (...args: A) => DePromisified<R> : never;

export function ing<T extends object>(chainEntryPoint: T): DePromisified<T>
{
    return new AsyncResolver(chainEntryPoint) as unknown as DePromisified<T>;
}

class AsyncResolver<T extends object> extends Function implements ProxyHandler<T>
{
    private currentPromise: Promise<any>;
    private proxyHandle: AsyncResolver<T>;
    private currentThis: any;

    constructor(chainHead: T)
    {
        super();
        this.currentPromise = Promise.resolve(chainHead);
        this.proxyHandle = new Proxy(this, this);
        return this.proxyHandle;
    }

    get(target: any, property: string)
    {
        switch (property)
        {
            case "then":
            case "catch":
            case "finally":
                //@ts-ignore
                return (...args: any[]) => this.currentPromise[property](...args);
            default:
                this.currentPromise = this.currentPromise.then(resolvedObject =>
                {
                    this.currentThis = resolvedObject;
                    return resolvedObject[property]
                });
                return this.proxyHandle;
        }
    }

    //@ts-ignore
    apply(target, thisArg, args)
    {
        this.currentPromise = this.currentPromise.then(
            resolvedFunction => Reflect.apply(resolvedFunction, this.currentThis, args)
        );
        return this.proxyHandle;
    }
}