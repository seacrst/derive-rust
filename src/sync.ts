import { Sized, isValue } from "./core";
import { Option } from "./option";
import { Err, Ok, Result } from "./result";

export class SenderError {
    error = "";

    constructor(impl: (self: SenderError) => void) {
        impl(this);
    }
}

export class ReceiverError<E> implements Sized<E> {
    $ref: [E] = [ReceiverError.name as E];
    variant = [ReceiverError.name, null as E];

    #variant(fn: Function, err: E) {
        this.$ref[0] = err;
        this.variant = [fn.name, err];
        Object.freeze(this);

        return this;
    }

    empty() {
        return this.#variant(this.empty, null as E);
    }

    error(err: E) {
        return this.#variant(this.error, err)
    }

    static Empty<E>() {
        return new ReceiverError<E>().empty();
    }


    static Error<E>(err: E) {
        return new ReceiverError<E>().error(err);
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
  
  send(value: T): Result<{}, SenderError> {
    if (isValue(value)) {
        this.#messages.unshift(value);
        return Ok({})
    } else {
        return Err(new SenderError(self => {
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

export class Sender<T> {
    tasks: Promise<Promise<T>[]> = Promise.resolve([]);

    constructor(impl: (self: Sender<T>) => void) {
        impl(this);
    }
    
    send(task: Promise<T>) {
        this.tasks.then(t => {
            t.unshift(task);
        });
    }
}

export class Receiver<T> {
    tasks: Promise<Promise<T>[]> = Promise.resolve([]);

    constructor(impl: (self: Receiver<T>) => void) {
        impl(this);
    }

    recv<E = unknown>(): Promise<Result<T, ReceiverError<E>>> {
        return this.tasks
            .then(t => {
                const task = t.pop();

                if (!task) {
                    return Err<ReceiverError<E>, T>(ReceiverError.Empty())
                }

                return task.then(t => {
                    return Ok<T, ReceiverError<E>>(t)
                }).catch(err => Err<ReceiverError<E>, T>(ReceiverError.Error(err)))
                
            }).catch(err => Err<ReceiverError<E>, T>(ReceiverError.Error(err)));
    }
}

export function channel<T>(): [Sender<T>, Receiver<T>] {
    const tasks: Promise<Promise<T>[]> = Promise.resolve([]);
    
    const tx = new Sender<T>(self => {
        self.tasks = tasks;
    });

    const rx = new Receiver<T>(self => {
        self.tasks = tasks;
    });
    
    return [tx, rx];
}