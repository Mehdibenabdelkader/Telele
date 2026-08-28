# telele

A teleprompter that runs in your browser. Nothing is uploaded, nothing is tracked.
Your script stays on your machine.

Live: https://telele.fluka.dev

## Why

I film short technical videos with my phone on a stand next to my laptop.
Every free teleprompter I tried wanted an account, or took over the whole
screen, or measured speed in a made-up number from 1 to 10.

## What it does

- Autoscroll at a real words-per-minute pace, so the read-time estimate is honest
- Font size, line gap, margins, and typeface all adjustable
- Resizable pane — drag the bar to leave room for your phone, dock it left or right
- Eye line marker with dimmed edges, so you look at the lens instead of scanning
- Cue notes: any line starting with `//` shows in amber and is skipped in the word count
- 3-2-1 countdown before the scroll starts
- Mirror mode for glass teleprompter rigs
- Right-to-left text support
- Keyboard control, so you never reach for the mouse mid-take
- Save scripts by name in the browser

## Keys

| key | does |
| --- | --- |
| `space` | play / pause |
| `R` | back to top |
| `up` / `down` | nudge the text |
| `[` `]` | speed down / up |
| `-` `=` | font smaller / bigger |
| `M` | mirror |
| `F` | fullscreen |
| `E` | edit script |
| `esc` | stop |

## Run it

No build step, no dependencies. Any static server works:

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080

## Deploy

Static files. Drop the folder on any static host.

```sh
wrangler pages deploy . --project-name=telele
```

## Known limits

- Saved scripts live in browser storage. Clear your browser data and they are gone.
- No offline support yet. A service worker is the next thing on the list.
- Deleting a saved script has no confirmation step.

## License

MIT
