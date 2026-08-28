import { Server as WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 Live Telemetry Client Connected");

    ws.send(JSON.stringify({
      type: "SYSTEM_CONNECTED",
      message: "Connected to JAL-RAKSHAK Real-Time Water Telemetry Stream"
    }));

    ws.on("close", () => {
      console.log("🔌 Live Telemetry Client Disconnected");
    });
  });
}

export function broadcastSensorUpdate(data: any) {
  if (!wss) return;
  const payload = JSON.stringify({ type: "SENSOR_UPDATE", data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function broadcastScenarioChange(scenario: string) {
  if (!wss) return;
  const payload = JSON.stringify({ type: "SCENARIO_CHANGED", scenario });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
