import axios from "axios";

const mainURL = axios.create({
  baseURL: "http://localhost:8080/",
});

export default mainURL;
