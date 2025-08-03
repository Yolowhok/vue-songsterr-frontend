import axios from "axios";

export function getInstruments() {
  return axios.get("http://localhost:8080/static/instruments");
}
