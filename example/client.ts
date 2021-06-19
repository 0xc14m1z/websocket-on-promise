import { Client, NativeSocketAdapter } from "../src";

type User = { name: string };

const backend = new Client(new NativeSocketAdapter("ws://localhost:22315"));

function runWopApi() {
  console.time("WOP");

  backend.get<User[]>("users").then(() => {
    console.timeEnd("WOP");
  });
}

function runExpressApi() {
  console.time("EXPRESS");

  fetch("http://localhost:3000/users")
    .then((response) => response.json())
    .then(() => {
      console.timeEnd("EXPRESS");
    });
}

document.getElementById("runWop").addEventListener("click", runWopApi);
document.getElementById("runExpress").addEventListener("click", runExpressApi);
