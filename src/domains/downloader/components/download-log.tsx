"use client";

import { Card, Typography, Space, Tag, Button } from "antd";
import { useRef, useState } from "react";
import { EInterval } from "../enums/binance.enum";

const { Text, Paragraph } = Typography;

interface DownloadLogProps {
  symbol: string;
  isAllSymbol?: boolean;
  interval: EInterval;
}

const DownloadLog: React.FC<DownloadLogProps> = ({
  symbol,
  isAllSymbol = false,
  interval = EInterval.One_Minute,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
  const eventSourceRef = useRef<EventSource | null>(null);

  const start = () => {
    setLogs([]);
    setStatus("running");

    const qs = new URLSearchParams({
      symbol,
      isAllSymbol: String(isAllSymbol),
      interval,
    });

    const es = new EventSource(`/api/binance?${qs.toString()}`);
    eventSourceRef.current = es;

    es.addEventListener("log", (e) => {
      setLogs((prev) => [...prev, (e as MessageEvent).data]);
    });

    es.addEventListener("done", () => {
      setStatus("done");
      es.close();
    });

    es.addEventListener("error", () => {
      setLogs((prev) => [...prev, "❌ Something went wrong"]);
      setStatus("error");
      es.close();
    });
  };

  const stop = () => {
    eventSourceRef.current?.close();
    setStatus("idle");
    setLogs((prev) => [...prev, "⛔ Processor has stopped"]);
  };

  const statusTag = {
    idle: <Tag color="default">Waiting for start</Tag>,
    running: <Tag color="processing">Running</Tag>,
    done: <Tag color="success">Finished</Tag>,
    error: <Tag color="error">Error</Tag>,
  }[status];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={start}
          loading={status === "running"}
          disabled={status === "running"}
        >
          Start
        </Button>
        <Button danger onClick={stop} disabled={status !== "running"}>
          Stop
        </Button>
      </Space>

      <Card
        title="Logs"
        extra={statusTag}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            height: "300px",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #d9d9d9",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          {logs.length === 0 && status === "idle" && (
            <Text type="secondary">
              Click start button to start download...
            </Text>
          )}
          {logs.map((line, idx) => (
            <Paragraph key={idx} style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {line}
            </Paragraph>
          ))}
        </div>
      </Card>
    </>
  );
};

export default DownloadLog;
