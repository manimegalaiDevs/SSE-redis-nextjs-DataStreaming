"use client";

import React, { useEffect, useState } from "react";

export default function FetchingDataFromRedis(): React.ReactElement {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/transfer-redis-data");

    eventSource.onmessage = (event) => {
      console.log("New message from server:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Live Redis Data</h1>
      {messages.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
