// Copyright (c) 2021 Magnus Meseck
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

type FunctionOrProperty<T>= T extends Function ? boolean : T;

type test = FunctionOrProperty<Object>;
type test1 = FunctionOrProperty<string>;

type test2 = FunctionOrProperty<() => string>;