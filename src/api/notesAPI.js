import axios from "axios";

export function getNotes() {
  return axios.get("http://localhost:8080/static/notes");
}

export function getOctaves() {
  return axios.get("http://localhost:8080/static/octaves");
}

export function getNoteOctavesOrdered() {
  return axios.get("http://localhost:8080/static/noteoctaves/ordered");
}
