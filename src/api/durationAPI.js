import axios from "axios";
import api from "./api";

export function getDurations() {
  return api.get("/static/durations");
}

