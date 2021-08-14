# Awaitium - behind the scenes

You may have had a look in the code and may seem a little confused about what's going on.

Let's analyze.

## Taming Typescript
One of the challenges to overcome when chaining multiple async and non async function calls and property accesses is to fake a non promise object, to allow for good intellisens completion and no errors when compiling.
One of the goals is hence - no matter what a function or property returns - to de-promisify it. We do this in the `Awaited` type.

let's translate... 
´´´´
type Awaited<T extends Object> = { 
    [Property in keyof T]: 
        T[Property] extends Function ? DePromisifiedReturnValue<T[Property]> :
        T[Property] extends Promise<infer V> ? V : 
        DePromisified<T[Property]>; 
    };
´´´´
...into human understandable language:
Awaited generally expects an object of type `T` - and transforms all `Properties` of this type `T` into something that is not a promise. If the `Property` is a function, we want to only un-promise it's return value, but if the `Property` is not a function, we have to apply other logic: If the property is a direct Promise, we extract the promise resolve type into `V`and return that - else we un-promise the property. This un-promising happens in the `DePromisified` type.

### Unpromising with `DePromisify`
````
type Wrapped<T> = T extends Object ? Awaited<T> & Promise<T> : T; `
````
This is almost self-explanantory. Remember that we apply `DePromisify` to every member of an object that is not a promise or a function - and this member can actually be a primitive type like `number`, `string` etc., that we do not need to unpromisify (because that's where the await chain would end anyway, as there are no more properties to access on a primitive type) - or an object again, to which we want to apply the same `Awaited` logic to all types.
We need to add the `& Promise` as we still want to be able to await the result.

### Unpromising functions? No, their return values!
For a function, we actually do not really want to unpromise the function itself, but the function result. This happens here:
´´´´
type DePromisifiedReturnValue<T extends Function> =
    T extends (...args: infer A) => Promise<infer R> ? (...args: A) => DePromisified<R> :
    T extends (...args: infer A) => infer R ? (...args: A) => DePromisified<R> : never;
´´´´

## Promise resolution

Looking at the source you may think: Hey, why don't you just make this a recursive function that returns Proxies? Well, exactly for that. We are using the `AsyncResolver`class here to minimize the creation of proxies as that is a quite expensive operation. Per call to `ing` only one proxy and Resolver instance is created that gets passed around from accessor/function call to the next throught the 

### Why are we extending `function`?
Wondering about `extends Function`. The reason is simple: In order for a Proxy to accept an `apply` handler we need to pass a function as a proxied object. As we want to proxy the `AsyncResolver` and also pass it around, we need it to inherit from `Function`.

### Chaining promises together
To better understand what we need to chain, let's decompose the following statement manually:
````
await ing(some).called().object.chain();
````
If we wrote this as a detailed promise chain we'd get:
````
    Promise.resolve(some).then(a => a.called()).then(b => b.object).then(c => c.chain())
````
Unfortunately, the `a.called()` called step is not as easy to replicate with a proxy as it's actually split up into two parts by the js engine:
1. retreiveing the function object through the `get`trap.
2. then calling the retrieved function through the `apply`trap.
There is also the case that a function may actually be wrapped in a promise...so we need to expand our chain even more:
````
    Promise.resolve(some).then(a => a.called).then(a_ = a_.apply(a_this, ...args)...
````
The challenge here is to get a reference to `this`. The `called()` should actually be applied to the resolved `some`. 
That's the reason why we have the `AsyncResolver.currentThis` property to keep track of this `this` reference - and we update it every time we retrieve a property from a resolved object:
````
    ...then(resolvedObject =>
        {
            this.currentThis = resolvedObject;
            return resolvedObject[property]
        });
````
We are then able to apply on exactly that object:
````
    ...then(resolvedFunction => 
        Reflect.apply(resolvedFunction, this.currentThis, args));
````

Hopefully this sheds a little light on the inner workings of this library.