import db from '@/db';

export default function runWithDBAndHandleErrors(fn: () => Promise<void>) {
  const runner = async () => {
    await db.authenticate();
    await fn();
  };
  runner().catch((err) => {
    throw err;
  });
}
