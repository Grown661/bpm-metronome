# BPM Metronom

**Live-Demo:** https://grown661.github.io/bpm-metronome/

Ein Metronom mit Tap-Tempo-Funktion, komplett im Browser — ohne Samples, ohne Libraries. Der Klick wird zur Laufzeit mit der Web Audio API erzeugt (OscillatorNode), das Timing laeuft ueber einen Lookahead-Scheduler statt ueber setInterval-Toene, damit es auch bei Tab-Lag praezise bleibt.

## Features

- **Tap-Tempo**: mehrmals im Takt tippen, BPM wird aus den Klick-Abstaenden gemittelt (letzte 8 Taps, Auto-Reset nach 2 s Pause)
- **Metronom** mit sample-genauem Web-Audio-Scheduling (Lookahead-Pattern)
- **Taktarten** 2/4, 3/4, 4/4 mit betontem Downbeat (hoeherer Klick, orange Anzeige)
- **BPM-Slider** 40–240
- **Visueller Beat-Indikator** synchron zum Audio
- Tastatur: `Leertaste` = Start/Stop, `T` = Tap

## Stack

- HTML, CSS, Vanilla JavaScript
- Web Audio API (OscillatorNode + GainNode, kein einziges Audio-File)
- Keine Dependencies, keine Build-Kette

## Setup & Start

```
index.html im Browser oeffnen — fertig.
```

Kein Server, kein Install noetig.

## Screenshot

_(Screenshot folgt)_
