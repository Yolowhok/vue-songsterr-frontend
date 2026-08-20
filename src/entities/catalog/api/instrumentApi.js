
import api from "@/shared/api/client";

export function getInstruments() {
  return api.get("/static/instruments");
}

