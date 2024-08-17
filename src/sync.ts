import { impl, Self } from "./mod";
import { Option } from "./option";
import { Err, Ok, Result } from "./result";

function isValue(value: any): boolean {
  return !(value === null || value === undefined);
}

export class SenderError {
    error = "";

    constructor(self: Self<SenderError>) {
        impl(this, self);
    }
}

export class ReceiverError {
  error: string;

  constructor(self: Self<ReceiverError>) {
    impl(this, self);
  }
}

class Propagation<E> {
  $propagation: E;

  constructor(value: E) {
    this.$propagation = value;
  }
}

export class SyncSender<T> {
  messages: T[] = [];

  constructor(self: Self<SyncSender<T>>) {
    impl(this, self);
  }
  
  send(value: T): Result<{}, SenderError> {
    if (isValue(value)) {
        this.messages.unshift(value);
        return Ok({})
    } else {
        return Err(new SenderError({error: typeof value === "object" ? "Null" : "Undefined"}));
    }
  }
}

export class SyncReceiver<T> {
  messages: T[] = [];

  constructor(self: Self<SyncReceiver<T>>) {
    impl(this, self);
  }

  recv(): Option<T> {
    return Option.from<T>(this.messages.pop());
  }
}

export function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>] {
  const messages: T[] = [];
  
  const tx = new SyncSender<T>({messages});
  const rx = new SyncReceiver<T>({messages});

  return [tx, rx];
}

export class Sender<T> {
  sender: SyncSender<Promise<T>>;

  constructor(self: Self<Sender<T>>) {
    impl(this, self);
  }
  
  send(task: Promise<T>) {
    this.sender.send(task.catch(err => new Propagation(err) as T));
  }
}

export class Receiver<T> {
    task: Promise<Result<T, ReceiverError>>;
    receiver: SyncReceiver<Promise<T>>;

    constructor(self: Self<Receiver<T>>) {
      impl(this, self);
    }

    recv<E = ReceiverError>(): Promise<Result<T, E>> {
      return this.receiver.recv().match({
        Some:(task) => task.then(ok => this.task
          .then(() => ok instanceof Propagation ? 
            Err<E, T>(ok.$propagation) :
            Ok<T, E>(ok)
          ))
          .catch(err => this.task.then(() => Err<E, T>(err as E))),
        None:() => Promise.resolve(Err<E, T>(new ReceiverError({error: "None"}) as E))
      })
    }
}

export function channel<T>(): [Sender<T>, Receiver<T>] {
    const task: Promise<Result<T, ReceiverError>> = Promise
      .resolve(Err<ReceiverError, T>(new ReceiverError({error: "None"})));

    const [sender, receiver] = syncChannel<Promise<T>>();
    
    const tx = new Sender<T>({sender});

    const rx = new Receiver<T>({receiver, task});
    
    return [tx, rx];
}
