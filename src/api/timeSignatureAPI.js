import axios from "axios";

export function getTimeSignatures() {
  return axios.get("http://localhost:8080/static/timeSignatures");
}
