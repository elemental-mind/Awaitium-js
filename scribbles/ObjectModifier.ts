// Copyright (c) 2021 Magnus Meseck
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

class SampleObject
{
    public prop: string;
    public num: number;
    public refToSampleObject2: SampleObject2;

    public async sampleAsync (a: number, b: string, c: Object)
    {
        return new SampleObject2();
    }

    public promise()
    {
        return new Promise<SampleObject2>(x => "");
    }

    public own()
    {
        return this;
    }
}

class SampleObject2
{
    public refToSampleObject1: SampleObject2;

    public async sampleAsync2 (a: number, b: string, c: Object)
    {
        return new SampleObject();
    }

    public promise2()
    {
        return new Promise<SampleObject>(x => "");
    }

    public own()
    {
        return this;
    }
}

type Wrapped<T> = T extends Object ? Awaited<T> & Promise<T> : T;

type ReturnWrapped<T extends Function> =
    T extends (...args: infer A) => Promise<infer R> ? (...args: A) => Wrapped<R> : 
    T extends (...args: infer A) => infer R ? (...args: A) => Wrapped<R> : 
    never;

type Awaited<T> = 
{
    [Property in keyof T]: T[Property] extends Function ? ReturnWrapped<T[Property]> : Wrapped<T[Property]>;
}

type objectTest = Awaited<SampleObject>

async function test()
{
    let something : objectTest
    const result = await something.refToSampleObject2.promise2().promise().promise2().own().sampleAsync(1, "two", {three: 3}).own();

    result.refToSampleObject1;
}