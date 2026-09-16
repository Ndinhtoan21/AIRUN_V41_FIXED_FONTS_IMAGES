# AIRUN V5.1

- Mobile UI rebuilt for phone widths: readable typography, no overlapping live card, compact hero, touch-friendly controls.
- Weather/AQI values now appear immediately from recent cache or clearly-labelled fallback data; the screen no longer stays blank while waiting for Open-Meteo.
- Live API sync runs in the background and replaces fallback values automatically when available.
- Open-Meteo payload reduced to 36 forecast hours and network timeout shortened.
- GPS state is shown immediately after a position is acquired; environment sync no longer blocks the GPS UI.
- Cache/service-worker bumped to V5.1.
