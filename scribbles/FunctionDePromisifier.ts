// Copyright (c) 2021 Magnus Meseck
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

type DePromisified<T extends Function> =
    T extends (...args: infer A) => Promise<infer R> ? (...args: A) => R : T;

async function sampleAsync()
{
    return 1;
}

async function sampleAsyncWithParams(one: number, two: string)
{
    return 123;
}

function samplePromiseReturning()
{
    return new Promise<string>(resolve => "Done!");
}

function samplePromiseReturningWithParams(one: number, two: string)
{
    return new Promise<string>(resolve => "Done!");
}

function normalFunction()
{
    return 123;
}

function normalFunctionWithParams(one: number, two: string)
{
    return 123
}

type dpaTest = DePromisified<typeof sampleAsync>;
type dpawpTest = DePromisified<typeof sampleAsyncWithParams>;
type dpprTest = DePromisified<typeof samplePromiseReturning>;
type dpprwpTest = DePromisified<typeof samplePromiseReturningWithParams>;
type dpnfTest = DePromisified<typeof normalFunction>;
type dpnfwpTest = DePromisified<typeof normalFunctionWithParams>;