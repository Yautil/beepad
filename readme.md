<div align="center">
<h1>BeePad</h1>

[![GitHub package version](https://img.shields.io/github/package-json/v/yautil/beepad.svg)]()
[![Build Status](https://travis-ci.org/Yautil/beepad.svg?branch=minimal_stable_v2.3.13)](https://travis-ci.org/Yautil/beepad)
[![Known Vulnerabilities](https://snyk.io/test/github/yautil/beepad/badge.svg?targetFile=package.json)](https://snyk.io/test/github/yautil/beepad?targetFile=package.json)
[![](https://img.shields.io/github/issues-raw/yautil/beepad.svg)](https://github.com/Yautil/beepad/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/yautil/beepad.svg)]()

![](https://files.catbox.moe/038x4c.gif)

<p>An Anonym Collaborative Text-Editor and Markdown Parser</p>

</div>

## Get Started
Clone the Repo or download our latest release [HERE](https://files.catbox.moe/r847kl.png)!

Start ```npm install``` in Root of repo.

Then Start Server with ```node server.js```
If needed, install webpack and run ```npx webpack src/client.js dist/client.js```

## Get a look on [this sweet OnePager](https://github.com/Yautil/beepad/blob/master/BeePad_OnePager.pdf):

[![](https://files.catbox.moe/nzm8mc.png)](https://github.com/Yautil/beepad/blob/master/BeePad_OnePager.pdf)

## Screenshots
![](https://files.catbox.moe/a8s25l.png)
![](https://files.catbox.moe/xdus4o.gif)
![](https://files.catbox.moe/lv39ew.png)
![](https://files.catbox.moe/1oxkm7.png)


## GNU GPLv3.0+
````
 BeePad - NodeJS Server File
    BeePad is an anonym collaborative online text-editor
    Copyright (C) 2018 Benjamin Laws, Ann-Kathrin Hillig, Matthias Schroer, Miguel Oppermann

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
````

## Design
"BeePad" ist eine Webanwendung zum anonymen collaborativen bearbeiten und speichern von Texten.
Unterstützt wird "BeePad" mit einem Markdown-Parser.
"BeePad" arbeitet in Echtzeit.

Die Webanwendung wurd in NodeJS entwickelt, da [blabla asynchron blabla].
![https://strongloop.com/blog-assets/2014/01/threading_node.png](https://strongloop.com/blog-assets/2014/01/threading_node.png)

Es muss mindestens einen Server für n-Clients geben. Dieser stellt dem Client HTML und JavaScript Dateien zur verfügung.

"BeePad" ist mit Absicht schlicht und einfach gehalten.
Es gibt weder Registrierung noch Anmeldung.

Dokument und Markdown-Parser synchronisieren ihren Inhalt in Echtzeit. Das Ergebnis des Markdown-Pasers kann gedruckt werden. In Kombination mit Windows 10, lässt sich der Markdown Output als PDF speichern.

Über einen permanenten Link ist ein Dokument jederzeit erreichbar. Jeder Zugriff auf diesen Link, kann das Dokument bearbeiten und exportieren.
<div style="page-break-after:always"></div>

### Datenbank

    pad
    - permalink
    - text

<div style="page-break-after:always"></div>

### Backend
Der Server muss bei Aufrufen der Hauptseite ein neues Dokument unter einem nicht vergebenen Permalink eintragen. Der Permalink, der aktuelle Dokumententitel und der Text müssen dabei in eine Datenbank eingetragen werden.

Alle Eingaben von Nutzern werden an den Server gesendet, dieser leitet die richtigen Daten an alle Clients, welche über den selben Permalink verbunden sind, weiter. 

Der aktuelle Textstand wird bei jeder Aktualisierung in die DB gespeichert.

Ein Aufruf von nicht vergebenen Permalinks verweist auf die Hauptseite, wo ein Permalink generiert wird.

<div style="page-break-after:always"></div>

### Frontend
Ein Nutzer, der die Hauptseite aufruft, bekommt automatisch ein neues Dokument zugewiesen, von hier aus kann er andere Nutzer einladen indem er ihnen den zugehörigen Link schickt.

Nutzer die ein bekanntes Dokument aufrufen, können sofort am Dokument arbeiten.

Der Client bekommt Text, muss diese mit dem aktuellen Text abgleichen und den gepatchten Text visualisieren.

<div style="page-break-after:always"></div>

## Ordnerstruktur
Die Ordnerstruktur ergibt sich aus dem folgendem Screenshot:
![screenshot](https://files.catbox.moe/j2y5jo.png)

Der Ordner ``` .db ```, wie auch der Ordner ``` node_modules ``` sind automatisch generiert.

### public
In diesem Ordner befinden sich alle Statischen-Dateien, welche von dem Server dem Nutzer bereitgestellt werden.

<div style="page-break-after:always"></div>

## Drittanbieter Abhängigkeiten / Node-Module
### chalk
### expressjs
### mongoosejs
### path
### socket.io
