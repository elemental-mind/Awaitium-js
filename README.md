# Awaitium - chain multiple awaits into one
Put your await on fire and make your code flow without intermediate awaits! Chain asynchrounous (and synchronous) functions together easily.

The best thing: Get full type support along the way. No fighting with the Typescript compiler. It's tamed!

# Example
Write...
````
async function testChainedAwait()
{
    ....
    chainResult = await ing(asyncGetObject()).asyncGetAnotherObject().objectProperty.asyncInstanceGetter().synchronousFunction();
    ....
}
````
...instead of...
````
async function helpIAmRunningOutOfVariableNames()
{
    ....
    const initialObject = await asyncGetObject();
    const intermediateObject = await initialObject.asyncGetAnotherObject();
    const wantedInstance = await intermediateObject.objectProperty.asyncInstanceGetter();

    chainResult=wantedInstance.synchronousFunction();
    ....
}
````
# Installation
There is no package published to npm yet. For now you need to copy paste `awaitium.ts` from the `source` directory of this repository into the source of your project and include it in any file you'd like to use it.

# Usage
To use Awaitium, simply wrap the entry point of your chain with the `ing(<yourEntryPoint>)` function. An entry point can be one of the following:
- a function call to a synchronous function: 
````
    await ing(syncFunction()).followedByAnyOf.asyncFunc().syncFunc().orPropOrMember
````
- a function call to an asynchronous function: 
````
    await ing(asyncFunction()).followedByAnyOf.asyncFunc().syncFunc().orPropOrMember
````
- any object: 
````
    await ing(object).followedByAnyOf.asyncFunc().syncFunc().orPropOrMember
````

The chain following the `ing` call may comprise any combination of the following:
- async function calls
- synchronous function calls
- property reads
- member reads

# Good to know
You must start your call chain (the start of the chain is the closing bracket of the `ing` function call) after the first call to an async function - but you can start your chain already at the very beginning:
````
    await ing(object.member.asyncFunction()).syncFunction().doSomethingElseAsync()
````
... is the same as ...
````
    await ing(object).member.asyncFunction().syncFunction().doSomethingElseAsync()
````
I like it clean: Personally I prefer wrapping objects (or function calls) the earliest possible. 

# Caveats
Behind the scenes every function call is awaited. As you can also chain synchronous function calls, that means these synchronous calls may also be waiting for their turn of the event loop (depending on the JS engine/environment, I guess?!).
This is uninvestigated, however - if you'd like to add more insight into this, feel free to raise an issue. In most applications this should have negligable impact, though.

# License
MIT
