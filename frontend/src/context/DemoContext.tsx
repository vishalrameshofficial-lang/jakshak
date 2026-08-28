import React, { createContext, useContext, useState, useEffect } from "react";
import { DemoScenario, SensorReading, WaterSource } from "../types";
import api from "../services/api";

interface DemoContextType {
  activeScenario: DemoScenario;
  setScenario: (scenario: DemoScenario) => Promise<void>;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
  latestReadings: Record<string, SensorReading>;
  sources: WaterSource[];
  refreshSources: () => Promise<void>;
  presentationModeActive: boolean;
  setPresentationModeActive: (active: boolean) => void;
  selectedSourceId: string;
  setSelectedSourceId: (id: string) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenarioState] = useState<DemoScenario>("NORMAL");
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [latestReadings, setLatestReadings] = useState<Record<string, SensorReading>>({});
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [presentationModeActive, setPresentationModeActive] = useState<boolean>(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");

  const refreshSources = async () => {
    try {
      const res = await api.get("/sources");
      if (res.data.success && res.data.data.length > 0) {
        setSources(res.data.data);
        if (!selectedSourceId) {
          const mineSource = res.data.data.find((s: WaterSource) => s.code === "KA-014") || res.data.data[0];
          setSelectedSourceId(mineSource.id);
        }
      }
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    refreshSources();
  }, []);

  // WebSocket real-time subscription
  useEffect(() => {
    const wsEnvUrl = import.meta.env.VITE_WS_URL;
    let wsUrl: string;
    if (wsEnvUrl) {
      wsUrl = wsEnvUrl;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "SENSOR_UPDATE" && message.data) {
          const { sourceId, reading } = message.data;
          setLatestReadings((prev) => ({ ...prev, [sourceId]: reading }));
          setSources((prevSources) =>
            prevSources.map((s) =>
              s.id === sourceId ? { ...s, currentRiskScore: reading.riskScore, lastUpdate: reading.timestamp } : s
            )
          );
        } else if (message.type === "SCENARIO_CHANGED" && message.scenario) {
          setActiveScenarioState(message.scenario);
        }
      } catch (e) {
        // Handle WS JSON error
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const setScenario = async (scenario: DemoScenario) => {
    setActiveScenarioState(scenario);
    try {
      await api.post("/demo/scenario", { scenario });
      await refreshSources();
    } catch (e) {
      // Local state active
    }
  };

  return (
    <DemoContext.Provider
      value={{
        activeScenario,
        setScenario,
        isLiveMode,
        setIsLiveMode,
        latestReadings,
        sources,
        refreshSources,
        presentationModeActive,
        setPresentationModeActive,
        selectedSourceId,
        setSelectedSourceId
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
};
