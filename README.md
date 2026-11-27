# Carlsberg Websites: 2026 Year in Review

A cinema-themed yearly review for the Digital Marketing IIT web team.

## Web presentation

Open `index.html` in a browser. Each scroll gesture moves one slide down or up.

| Action | Keys |
| --- | --- |
| Next slide | Click, scroll down, ↓, →, Space, Page Down, swipe up |
| Previous slide | Shift + click, scroll up, ↑, ←, Page Up, swipe down |
| First / last slide | Home / End |
| Fullscreen | F |
| Mute / unmute music | M, or the speaker button (top right) |

The dots on the right jump to any slide, and `index.html#12` opens slide 12 directly.

### Intro music

`assets/intro.mp3` ("Eye of the Tiger" by Survivor) plays at full volume on the first slide, drops to a low background level on the Starring and special guest slides (2–9), fades out after the last guest, and comes back at full volume on the final slide ("The End"), picking up where it left off, or from the start if it has already finished. Which slides play it, and how loud, is set by `data-music="full"` or `data-music="low"` on each slide in `index.html`.

Browsers only allow sound after a click or key press, so on the first slide the first click (or Enter / Space) starts the music instead of moving on. Moving between slides fades the volume up or down; going back resumes where it left off. Once the song has finished, the speaker button (or M) replays it. If you scroll first, the slide changes and no music plays.

The song is copyrighted: keep this repository private, and don't publish the presentation on a public site with the song in it. To use another track, replace `assets/intro.mp3` with your own file under the same name.

## PDF

`Websites2026_YearInReview_Cinema.pdf` is a snapshot of the web version, one page per slide, without animations or music.

## PowerPoint

`Websites2026_YearInReview_Cinema.pptx` is an earlier PowerPoint version of the deck. It is no longer updated; the web version is the current one.
