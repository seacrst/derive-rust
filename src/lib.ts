import { match } from "./match";

export * from "./cmp";
export * from "./common";
export * from "./match";
export * from "./option";
export * from "./result";

interface AB {
  foo?(): void
  bar?(): void
}

class A implements AB {
  x = {
    a: 1
  };

  b = "eke"

  foo() {
    console.log(this.x.a);
  }
}



class B implements AB {
  x = {
    a: 1
  };

  b = "eke"

  bar() {
    console.log(this.x.a);
  }
}


const r = match([() => {}], () => [
  [[() => {}], () => true],
  [[() => {}], () => false],
], () => false)


const a = new A();

console.log(r)