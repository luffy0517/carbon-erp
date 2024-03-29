import { redis } from "@carbon/redis";
import type { Processor } from "bullmq";
import { Queue as BullQueue, Worker } from "bullmq";

type RegisteredQueue = {
  queue: BullQueue;
  worker: Worker;
};

declare global {
  var __registeredQueues: Record<string, RegisteredQueue> | undefined;
}

const registeredQueues =
  global.__registeredQueues || (global.__registeredQueues = {});

export const Queue = <Payload>(
  name: string,
  handler: Processor<Payload>
): BullQueue<Payload> => {
  if (registeredQueues[name]) {
    return registeredQueues[name].queue;
  }

  // Bullmq queues are the storage container managing jobs.
  const queue = new BullQueue<Payload>(name, { connection: redis });

  // Workers are where the meat of our processing lives within a queue.
  // They reach out to our redis connection and pull jobs off the queue
  // in an order determined by factors such as job priority, delay, etc.
  // The scheduler plays an important role in helping workers stay busy.
  const worker = new Worker<Payload>(name, handler, { connection: redis });

  // It is important to properly close the job when the server is restarted.
  process.on("SIGINT", async () => {
    await worker.close();
  });

  registeredQueues[name] = { queue, worker };

  return queue;
};
