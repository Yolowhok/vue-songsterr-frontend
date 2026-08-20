import axios from "axios";
import api from "./api";

export function getTimeSignatures() {
  return api.get("/static/timeSignatures");
}

