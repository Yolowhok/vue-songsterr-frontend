import axios from "axios";

import api from "./api";

export function getInstruments() {
  return api.get("/static/instruments");
}

