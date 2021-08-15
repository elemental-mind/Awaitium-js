// Copyright (c) 2021 Magnus Meseck
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ing } from '../source/awaitium.ts';
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

class AsyncObject
{
    public callLog: number[];
    public a_self: AsyncObject;

    constructor()
    {
        this.callLog = [];
        this.a_self = this;
    }

    static wait(milliSeconds: number)
    {
        return new Promise(resolve => setTimeout(resolve, milliSeconds));
    }

    async b_delay(time: number): Promise<AsyncObject>
    {
        await AsyncObject.wait(time);
        this.callLog.push(0);
        return this;
    }

    c_returnPromise(time: number): Promise<AsyncObject>
    {
        this.callLog.push(1);
        return new Promise(resolve => AsyncObject.wait(time).then(value => resolve(this)));
    }

    d_sync()
    {
        this.callLog.push(2);
        return this;
    }

    get e_property()
    {
        this.callLog.push(3);
        return this;
    }

    get f_promiseProperty(): Promise<AsyncObject>
    {
        this.callLog.push(4);
        return new Promise(resolve => AsyncObject.wait(10).then(value => resolve(this)));
    }

    async g_final()
    {
        this.callLog.push(5);
        return this;
    }
}

Deno.test("Base resolution", async () =>
{
    let testSubject = new AsyncObject();
    let resolved = await ing(testSubject);

    assertNotEquals(resolved.constructor.name, "Promise");
    assertEquals(resolved.callLog.length, 0);
});

Deno.test("Asnyc function resolution", async () =>
{
    let testSubject = new AsyncObject();
    let resolved = await ing(testSubject).a_self.b_delay(10);

    assertNotEquals(resolved.constructor.name, "Promise");
    for (const index of [0])
    {
        assertEquals(resolved.callLog[index], index);
    }
});


Deno.test("Promise returning function resolution", async () =>
{
    let testSubject = new AsyncObject();
    let resolved = await ing(testSubject).a_self.b_delay(10).c_returnPromise(10);

    assertNotEquals(resolved.constructor.name, "Promise");
    for (const index of [0, 1])
    {
        assertEquals(resolved.callLog[index], index);
    }
});

Deno.test("Syncronous function resolution", async () =>
{
    let testSubject = new AsyncObject();
    let resolved = await ing(testSubject).a_self.b_delay(10).c_returnPromise(10).d_sync();

    assertNotEquals(resolved.constructor.name, "Promise");
    for (const index of [0, 1, 2])
    {
        assertEquals(resolved.callLog[index], index);
    }
});

Deno.test("Syncronous property accessor", async () =>
{
    let testSubject = new AsyncObject();
    let resolved = await ing(testSubject).a_self.b_delay(10).c_returnPromise(10).d_sync().e_property;

    assertNotEquals(resolved.constructor.name, "Promise");
    for (const index of [0, 1, 2, 3])
    {
        assertEquals(resolved.callLog[index], index);
    }
});

Deno.test("Promise property accessor", async () =>
{
    let testSubject = new AsyncObject();
    let resolved = await ing(testSubject).a_self.b_delay(10).c_returnPromise(10).d_sync().e_property.f_promiseProperty;

    assertNotEquals(resolved.constructor.name, "Promise");
    for (const index of [0, 1, 2, 3, 4])
    {
        assertEquals(resolved.callLog[index], index);
    }
});