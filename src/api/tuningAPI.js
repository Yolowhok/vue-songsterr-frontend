import axios from "axios";
import api from "./api";

export function getTunings() {
  return api.get("/static/tunings");
}
