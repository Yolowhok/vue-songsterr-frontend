import axios from "axios";

export function getCompositions() {
  return axios.get("http://localhost:8080/compositions");
}

export function getCompositionById(id) {
  return axios.get(`http://localhost:8080/composition/${id}`);
}

export function getCompositionByIdFull(id) {
  return axios.get(`http://localhost:8080/composition/${id}/full`);
}

export function getCompositionNotesheetsListById(id) {
  return axios.get(`http://localhost:8080/composition/${id}/notesheets`);
}

export function saveComposition(data) {
  return axios.post("http://localhost:8080/composition/update", data);
}

export function createComposition(data) {
  return axios.post("http://localhost:8080/composition/create", data);
}
