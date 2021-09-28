# Reduced test case

[Bug report][bug report]

## Usage

```
yarn
PORT=8080 nodemon index.js
```

## Description of problem/workaround

This description is similar to the one provided in the [bug report] but with a few more details.

Any requests made on click are cancelled. See branch `master`.

We can workaround this by making the requests in a `setTimeout`. See branch `delay-slow`.

However, this workaround will not work if any of the following conditions are met:

- The timeout is too fast e.g. 10ms. See branch `delay-fast`.
- The download response has the response header `content-type: text/plain` (there are probably many other conditions). See branch `delay-slow+content-type`.

When this happens, the requests fail again but this time we observe slightly different behaviour. The requests are not cancelled (in fact we don't even see them in the network panel) but instead fail due to "access control checks" error (seen in the console).

### Page is (sometimes) frozen when the prompt is open

If the download response has the response header `content-type: text/plain`, we also observe some interesting differences when the download prompt is open:

- The page in the background is completely frozen. If we delete elements from the page e.g. using dev tools, the page is not repainted.
- Animation frames are paused, e.g. if we run this in the console, the `console.log` doesn't happen until the prompt is closed: `requestAnimationFrame(() => { console.log('now') })`.

See branch `delay-slow+content-type`.

Note: this doesn't happen if we remove the response header `content-type: text/plain`. See branch `delay-slow`. There are probably other conditions which trigger this.

This could explain why we might see differences between environments, if there is even a slight difference in the download request/response (e.g. Fastly vs no Fastly, HTTP 2 vs HTTP 1, HTTPS vs HTTP, same origin vs cross origin, etc).

With this knowledge, we tried to workaround the problem by scheduling the requests inside an animation frame when the link is clicked.

If we wait for just one animation frame before making the requests, it seems to run the animation frame immediately, before the prompt opens (before the page freezes) and therefore the requests fail. See branch `1-rafs+content-type`.

If we wait for two animation frames, it seems there is some sort of race condition: sometimes the second animation frame will run after the prompt is closed (when the page is no longer frozen) and therefore the requests will succeed, but other times it will run before the prompt opens (before the page freezes) and therefore the requests will fail. See branch `2-rafs+content-type`.

### The final workaround

The `focus` event is fired on the `window` when the prompt is closed.

If we switch from a timeout to listening for the `window` `focus` event instead, the problem remains. See branch `focus+content-type`.

Fortunately, it seems that the problem doesn't occur if we listen for the `window` `focus` event _and then_ the next animation frame. See branch `workaround`.

[bug report]: https://bugs.webkit.org/show_bug.cgi?id=220621

### Update: iOS 15

When iOS 15 was released, we discovered new issues with the workaround described above.

https://www.loom.com/share/e7a28382ac3248cf8aaf1a8cf9cbb297

*If the user has not scrolled the page*, the `focus` event **is** fired on the `window` when the prompt is closed, as before.

*If the user has scrolled the page*, the `focus` event **is not** fired on the `window` when the prompt is closed.

For a reduced test case (applied on top of `workaround` branch), see branch `workaround-ios-15-bug`.

Fortunately, the `resize` event is fired instead, so we extend our workaround to listen for that as well as `focus`. See branch `workaround-ios-15-bug-fix`.