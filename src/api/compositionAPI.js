import api from "./api";
import axios from "axios";
export function getCompositions() {
  return api.get("/compositions");
}

export function getCompositionById(id) {
  return api.get(`/composition/${id}`);
}

export function getCompositionByIdFull(id) {
  return api.get(`/composition/${id}/full`);
}

export function getCompositionNotesheetsListById(id) {
  return api.get(`/composition/${id}/notesheets`);
}

export function saveComposition(data) {
  return api.post("/composition/update", data);
}

export function createComposition(data) {
  return api.post("/composition/create", data);
}

// import axios from "axios";
// import api from "./api";

// export function getCompositions() {
//   return axios.get("http://localhost:8080/compositions");
// }

// export function getCompositionById(id) {
//   return axios.get(`http://localhost:8080/composition/${id}`);
// }

// export function getCompositionByIdFull(id) {
//   return axios.get(`http://localhost:8080/composition/${id}/full`);
// }

// export function getCompositionNotesheetsListById(id) {
//   return axios.get(`http://localhost:8080/composition/${id}/notesheets`);
// }

// export function saveComposition(data) {
//   return axios.post("http://localhost:8080/composition/update", data);
// }

// export function createComposition(data) {
//   return axios.post("http://localhost:8080/composition/create", data);
// }
