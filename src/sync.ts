import { Self, Sized, isValue } from "./core";
import { None, Option } from "./option";
import { Err, Ok, Result } from "./result";

export class SenderError {
    error = "";

    constructor(impl: (self: SenderError) => void) {
        impl(this);
    }
}

export class ReceiverError {
  error: string;

  constructor(self: Self<ReceiverError>) {
    self(this);
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

  constructor(impl: (self: SyncSender<T>) => void) {
    impl(this);
  }
  
  send(value: T): Result<{}, SenderError> {
    if (isValue(value)) {
        this.messages.unshift(value);
        return Ok({})
    } else {
        return Err(new SenderError(self => {
            self.error = "No valid value has been sent";
        }));
    }
  }
}

export class SyncReceiver<T> {
  messages: T[] = [];

  constructor(impl: (self: SyncReceiver<T>) => void) {
    impl(this);
  }

  recv(): Option<T> {
    return Option.from<T>(this.messages.pop());
  }
}

export function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>] {
  const messages: T[] = [];
  
  const tx = new SyncSender<T>(self => void (self.messages = messages));
  const rx = new SyncReceiver<T>(self => void (self.messages = messages));

  return [tx, rx];
}

export class Sender<T> {
  sender: SyncSender<Promise<T>>;

  constructor(self: Self<Sender<T>>) {
    self(this);
  }
  
  send(task: Promise<T>) {
    this.sender.send(task.catch(err => new Propagation(err) as T));
  }
}

export class Receiver<T> {
    task: Promise<Result<T, ReceiverError>>;
    receiver: SyncReceiver<Promise<T>>;

    constructor(self: Self<Receiver<T>>) {
      self(this);
    }

    recv<E = ReceiverError>(): Promise<Result<T, E>> {
      return this.receiver.recv().match({
        Some:(task) => task.then(ok => this.task
          .then(() => ok instanceof Propagation ? 
            Err<E, T>(ok.$propagation) :
            Ok<T, E>(ok)
          ))
          .catch(err => this.task.then(() => Err<E, T>(err as E))),
        None:() => Promise.resolve(Err<E, T>(new ReceiverError(self => self.error = "None") as E))
      })
    }
}

export function channel<T>(): [Sender<T>, Receiver<T>] {
    const task: Promise<Result<T, ReceiverError>> = Promise
      .resolve(Err<ReceiverError, T>(new ReceiverError(self => self.error = "None")));

    const [sender, receiver] = syncChannel<Promise<T>>();
    
    const tx = new Sender<T>(self => {
        self.sender = sender;
    });

    const rx = new Receiver<T>(self => {
        self.task = task;
        self.receiver = receiver;
    });
    
    return [tx, rx];
}
