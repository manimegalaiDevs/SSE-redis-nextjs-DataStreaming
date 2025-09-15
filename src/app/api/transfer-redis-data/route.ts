export {};

export const dynamic = "force-dynamic";

export function GET(): Response {
  return new Response(
    new ReadableStream({
      start(controller: ReadableStreamDefaultController) {
        const encoder = new TextEncoder();

        // Push controller safely (no optional chaining needed)
        globalThis.sseClients?.push(controller);

        controller.enqueue(
          encoder.encode(`${JSON.stringify({ type: "connected" })}\n\n`)
        );
      },
      cancel(controller: ReadableStreamDefaultController) {
        globalThis.sseClients = globalThis.sseClients?.filter(
          (c) => c !== controller
        );
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // for Nginx
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

