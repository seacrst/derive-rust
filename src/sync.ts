import { Self, Sized, isValue } from "./core";
import { Option } from "./option";
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
  task: Promise<Result<T, ReceiverError>>;
  sender: SyncSender<Promise<T>>;

  constructor(self: Self<Sender<T>>) {
    self(this);
  }
  
  send(task: Promise<T>) {
    this.sender.send(task.catch(err => err));
  }
}

export class Receiver<T> {
    task: Promise<Result<T, ReceiverError>>;
    receiver: SyncReceiver<Promise<T>>;

    constructor(self: Self<Receiver<T>>) {
      self(this);
    }

    recv(): Promise<Result<T, ReceiverError>> {
      const error = new ReceiverError(self => self.error = ReceiverError.name);
      return this.receiver.recv().match({
        Some: (task) => task
          .then(ok => this.task.then(() => Ok<T, ReceiverError>(ok)))
          .catch(err => this.task.then(() => Err<ReceiverError, T>(err as ReceiverError))),
        None: () => Promise
          .resolve(Err<ReceiverError, T>(error))
      })
    }
}

export function channel<T>(): [Sender<T>, Receiver<T>] {
    const task: Promise<Result<T, ReceiverError>> = Promise
      .resolve(Err<ReceiverError, T>(new ReceiverError(self => self.error = ReceiverError.name)));

    const [sender, receiver] = syncChannel<Promise<T>>();
    
    const tx = new Sender<T>(self => {
        self.sender = sender;
        self.task = task
    });

    const rx = new Receiver<T>(self => {
        self.task = task;
        self.receiver = receiver;
    });
    
    return [tx, rx];
}
