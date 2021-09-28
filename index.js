const path = require("path");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(
    `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
      const request = () => {
        fetch("/ping");

        const img = document.createElement('img');
        img.src = "/bug.png";
        document.body.appendChild(img)
      };

      window.now = () => {
        window.onfocus = () => {
          requestAnimationFrame(() => {
            request();
          })

          window.onfocus = undefined;
        }

        window.onresize = () => {
          requestAnimationFrame(() => {
            request();
          })

          window.onresize = undefined;
        }
      }
    </script>
    <div style="background: black; height: 400px;"></div>
    <a href="/file" download onclick="window.now()">download</a>
    <div style="background: black; height: 400px;"></div>
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
