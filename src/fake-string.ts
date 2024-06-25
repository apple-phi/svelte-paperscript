// Mock a MagicString instance
export class FakeString {
  original: string;
  constructor(str: string, ..._: any) {
    this.original = str;
  }

  replace(searchValue: string | RegExp, replaceValue: string): FakeString;
  replace(
    searchValue: string | RegExp,
    replacer: (substring: string, ...args: any[]) => string
  ): FakeString;
  replace(
    searchValue: string | RegExp,
    replaceValue: string | ((substring: string, ...args: any[]) => string)
  ): FakeString {
    if (typeof replaceValue === "function") {
      return new FakeString(this.original.replace(searchValue, replaceValue));
    } else {
      return new FakeString(this.original.replace(searchValue, replaceValue));
    }
  }

  prepend(str: string): FakeString {
    this.original = str + this.original;
    return new FakeString(this.original);
  }

  append(str: string): FakeString {
    this.original += str;
    return new FakeString(this.original);
  }

  toString(): string {
    return this.original;
  }

  //   generateMap(..._: any): undefined {
  //     return undefined;
  //   }
}
