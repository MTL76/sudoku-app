import { app } from "./app";

// This file is the runtime entry point.
// It is similar to Pascal program initialization code that wires and starts.
// App structure lives in app.ts, startup side effects live here.
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
