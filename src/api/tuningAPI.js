import axios from "axios";

export function getTunings() {
  return axios.get("http://localhost:8080/static/tunings");
}
