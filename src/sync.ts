import { isValue } from "./core";
import { Option } from "./option";
import { Err, Ok, Result } from "./result";

export class SyncSenderError {
    error = "";

    constructor(impl: (self: SyncSenderError) => void) {
        impl(this);
    }
}

export class SyncSender<T> {
  #messages: T[] = [];
  
  set messages(msgs: T[]) {
    this.#messages.length === 0 && void (this.#messages = msgs);
  }

  constructor(impl: (self: SyncSender<T>) => void) {
    impl(this);
  }
  
  send(value: T): Result<{}, SyncSenderError> {
    if (isValue(value)) {
        this.#messages.unshift(value);
        return Ok({})
    } else {
        return Err(new SyncSenderError(self => {
            self.error = "No valid value has been sent";
        }));
    }
  }
}

export class SyncReceiver<T> {
  #messages: T[] = [];

  set messages(msgs: T[]) {
    this.#messages.length === 0 && void (this.#messages = msgs);
  }

  constructor(impl: (self: SyncReceiver<T>) => void) {
    impl(this);
  }

  recv(): Option<T> {
    return Option.from<T>(this.#messages.pop()!);
  }
}

export function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>] {
  const messages: T[] = [];
  
  const tx = new SyncSender<T>(self => void (self.messages = messages));
  const rx = new SyncReceiver<T>(self => void (self.messages = messages));

  return [tx, rx];
}