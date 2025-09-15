/* eslint-disable no-var -- Required for global variable declaration in Next.js API route */
declare global {
  var sseClients: ReadableStreamDefaultController[] | undefined;
}
/* eslint-enable no-var -- End of global variable declaration */

// Ensure the global array exists
if (typeof globalThis.sseClients === "undefined") {
  globalThis.sseClients = [];
}

export function broadcastEvent(message: string): void {
  if (globalThis.sseClients?.length === 0) return;

  const data = `data: ${message}\n\n`;
  const encoded = new TextEncoder().encode(data);

  globalThis.sseClients = globalThis.sseClients?.filter((controller) => {
    try {
      controller.enqueue(encoded);
      return true;
    } catch {
      return false; // remove closed client
    }
  });
}
