import api from "@/shared/api/client";

export function getTunings() {
  return api.get("/static/tunings");
}
