import React from "react";
import { SIHPresentationOverlay } from "../components/sih/SIHPresentationOverlay";
import { useNavigate } from "react-router-dom";

export const PresentationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <SIHPresentationOverlay onClose={() => navigate("/dashboard")} />
    </div>
  );
};
