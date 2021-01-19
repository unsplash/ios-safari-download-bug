const path = require("path");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(
    `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
      window.now = () => {
        window.onfocus = () => {
          fetch("/ping");

          const img = document.createElement('img');
          img.src = "/bug.png";
          document.body.appendChild(img)

          window.onfocus = undefined;
        }
      }
    </script>
    <a href="/file" download onclick="window.now()">download</a>
  `
  );
});

app.get("/file", (req, res) => {
  res.set("content-type", "text/plain");
  res.send("file");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/bug.png", (req, res) => {
  res.sendFile(path.join(__dirname, "./bug.png"));
});

app.listen(process.env.PORT, () => console.log("running"));
