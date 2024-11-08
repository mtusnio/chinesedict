# Chinese-English Popup Dictionary - Mandarin & Cantonese

## Contributions

If you would like to contribute to the project feel free to open issues or,
even better, pull requests. See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Highlights

All features from the original extension and a few extra ones focused on the
Cantonese language are available:

- Supports both traditional and simplified characters.
- Includes both the [CEDICT](https://cc-cedict.org/wiki) Chinese English
  dictionary as well as https://cantonese.org/download.html)[CC-Canto]
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

## Keyboard Shortcuts

### Navigation

- <kbd>N</kbd> to move forward one word
- <kbd>B</kbd> to move back one word
- <kbd>M</kbd> to move forward one *character* - eg. it will display the second
  character in a two character word.
- <kbd>X</kbd> and move the window up and down respectively
- <kbd>A</kbd> moves the window to

### Word List

- <kbd>Alt</kbd> + <kbd>W</kbd> to open the word list.
- <kbd>R</kbd> to save a word to the list.

### Online dictionaries

* <kbd>Alt</kbd> + <kbd>1</kbd> looks up the selected word using [LINE Dict](https://dict.naver.com/linedict/zhendict).
* <kbd>Alt</kbd> + <kbd>2</kbd> lets you look up the pronunciation on [Forvo](https://forvo.com).
* <kbd>Alt</kbd> + <kbd>3</kbd> takes you to [Dict.cn](https://dict.cn).
* <kbd>Alt</kbd> + <kbd>4</kbd> uses [iCIBA](https://www.iciba.com).
* <kbd>Alt</kbd> + <kbd>5</kbd> looks up the word in the [MDBG dictionary](https://mdbg.net).
* <kbd>Alt</kbd> + <kbd>6</kbd> takes you to [MoeDict](https://moedict.tw).
* <kbd>T</kbd> is for looking up example sentences at [Tatoeba](https://tatoeba.org).

### Misc

- <kbd>S</kbd> to add a word to your Skritter queue. You will need to be logged into Skritter for this to work.
- <kbd>C</kbd> on the keyboard to copy the text together with dictionary
  entries into your clipboard. This is useful if you then want to insert them
  into Anki or your own words Spreadsheet.
- <kbd>E</kbd> to play the Cantonese pronunciation of the selected character or phrase
- <kbd>W</kbd> to play the Mandarin pronunciation of the selected character or phrase
  - For Linux users the TTS is not available using Brave, Firefox, and Chromium, but should work with Google Chrome.
  - To enable text to speech go to `Extensions` (the jigsaw icon on the top right) > `More actions` (three dots on the right of the `Mandarin + Cantonese` extension) > `Options`. On the `Options` page, scroll to the very bottom and check the box for the option `Enable text-to-speech`.

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
