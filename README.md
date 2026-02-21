# Chinese-English Popup Dictionary - Mandarin & Cantonese

## Contributions

If you would like to contribute to the project feel free to open issues or,
even better, pull requests. See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Highlights

All features from the original extension and a few extra ones focused on the
Cantonese language are available:

- Supports both traditional and simplified characters.
- Includes both the [CEDICT](https://cc-cedict.org/wiki) Chinese English
  dictionary as well as [CC-Canto](https://cantonese.org/download.html)
  dictionary.
- Shows Jyutping and Pinyin alongside characters.
- As a learning aid it uses different colors for displaying the Pinyin
  syllables, depending on the tone of the Chinese character.
- Can be turned on and off with a single mouse-click.
- Highlights the characters whose translation is displayed in the pop-up
  window.
- Also supports keyboard navigation for translating the next character, the
  next word, or the previous character.
- Allows you to add words to a built-in word list. Words from this list can be
  exported to a text file for further processing, such as importing the words
  into [Anki](https://apps.ankiweb.net).
- Includes links to grammar and usage notes on the
  [Chinese Grammar Wiki](https://resources.allsetlearning.com/chinese/grammar).
- Supports exporting words to the [Skritter](https://skritter.com) vocabulary
  queue.
- Zhuyin display can be enabled

## Options and word list

Right click on the icon of the extension and you will now be able to open
the word list and and a tab with options. This will let you further customize
your experience.

## Pinyin colors and tones
- First tone syllables are shown in red.
- Second tone syllables are shown in orange.
- Third tone syllables are shown in green.
- Forth tone syllables are shown in blue.

## Development

### Pupeeter Dependencies

```sh
npx @puppeteer/browsers install chrome@stable
npx @puppeteer/browsers install firefox@stable
```
https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-doesnt-launch-on-linux

### WSL Fonts for test cases

When running WSL you will need Chinese font to be available for the browser tests to pass, see below

https://help.accusoft.com/PrizmDoc/v12.2/HTML/Installing_Asian_Fonts_on_Ubuntu_and_Debian.html

## Legal
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

---

*Copyright (C) 2024 Michal Tusnio*

Original extension & documentation
*Copyright (C) 2019 Christian Schiller*
