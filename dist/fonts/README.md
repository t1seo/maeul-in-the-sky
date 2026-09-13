# PNG export font

`NotoSansKR.ttf` is a regular-weight static instance of the Noto Sans KR variable font from
[Google Fonts](https://github.com/google/fonts/blob/b38c5c93af322c45f633e17ac440ec1e6c94d489/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf).
It is distributed under the SIL Open Font License in `OFL.txt`.

The instance was generated with FontTools 4.65.0 at `wght=400` and an updated name table.
This avoids the thin default axis position when the PNG renderer reads a variable font.
To regenerate, download the pinned source above and run:

```sh
uvx --from fonttools==4.65.0 fonttools varLib.instancer NotoSansKR.ttf wght=400 --update-name-table --output assets/fonts/NotoSansKR.ttf
```

The portable PNG renderer loads this font locally so exported titles and statistics,
including Korean text, do not depend on fonts installed on a GitHub Actions runner.
The browser demo uses system fonts and does not download this file.
