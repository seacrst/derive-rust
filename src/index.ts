import { range } from "./range";
import { Receiver, ReceiverError, channel } from "./sync";

export * from "./cmp";
export * from "./core";
export * from "./match";
export * from "./option";
export * from "./result";
export * from "./sync";
export * from "./range";

const [tx, rx] = channel<{data: string[]}>();

tx.send(Promise.resolve({data: ["foo"]}));
tx.send(Promise.reject("ERROR"));
tx.send(Promise.resolve({data: ["bar"]}));

range(1, 5).forEach(async (idx) => {
  const result = await rx.recv();

  result.mapErr((err) => idx !== 2 ? "Empty" : err).match({
    Ok:(data) => console.log("ok ==> ", data, idx),
    Err:(err) => console.error("err ==> ", err, idx) 
  })
});

rx.recv().then(r => r.mapErr(() => "Completed").match({
    Ok:(data) => console.log(data),
    Err:(err) => console.error("err ==>", err, 5) 
  })
);