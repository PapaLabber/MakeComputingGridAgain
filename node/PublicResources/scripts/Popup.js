import { baseURL } from "./config"

document.addEventListener('DOMContentLoaded', function () {
    fetch(`${baseURL}/node/login`,{
        method: `POST`
    });
})