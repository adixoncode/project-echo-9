# PROJECT ECHO-9 — zadanie dla Codexa

**Status: READY FOR CODEX** · Repozytorium: `adixoncode/project-echo-9` · gałąź docelowa: `main`.

Adrian zatwierdził koncepcję i specyfikację. Implementację należy wykonać w samodzielnej sesji Codexa, nie przez ręczne przepisywanie kodu w rozmowie. Użyj GPT-6.1 Sol na wysokim poziomie rozumowania do kodowania, a przy trudnych decyzjach/wizualnej ocenie rozważ GPT-6 Astra. Nie deklaruj testów GPU jako zaliczonych bez realnych pomiarów.

Przed rozpoczęciem: sprawdź `AGENTS.md` (repozytorium jest świeże i obecnie nie posiada tego pliku), utwórz go zgodnie z zasadami użytkownika, jeśli brak. Zakres projektu i plan opisane niżej zostały zatwierdzone. Nie dotykaj niezwiązanych repozytoriów ani obszarów zakazanych. Zakończ pracę buildem, zielonym `RunAllTests`, aktualizacją `AGENTS.md` i karty, commitem na `main` oraz `git push`. Jeśli któryś krok wymaga nowych uprawnień lub jest blokowany, zgłoś to bez obchodzenia ograniczeń.

## Kryteria odbioru

- [ ] Oryginalna scena WebGPU: obserwatorium, korytarz serwisowy i hangar, nawigacja i proceduralne oświetlenie.
- [ ] Jeden offline `index.html`, bez zewnętrznych modeli, tekstur i bibliotek 3D.
- [ ] Sześć widoków krytyka wizualnego i poprawki iteracyjne.
- [ ] Powtarzalny 60-sekundowy fly-through i raport wydajności z rzeczywistym statusem `PASS`/`FAIL`/`BLOCKED`.
- [ ] Build, zielony `RunAllTests`, dokumentacja, karta, commit na `main`, push.

<details><summary>Pełna specyfikacja</summary>

# PROJECT ECHO-9 — specyfikacja eksperymentu

**Status:** DRAFT — do zatwierdzenia przez Adriana, bez autoryzacji implementacji.  
**Wersja:** 0.1 · 16 listopada 2026

## 1. Cel

Stworzyć efektowną, eksplorowalną scenę 3D opuszczonej stacji kosmicznej, działającą w przeglądarce z użyciem WebGPU. Sprawdzić, czy agent kodujący potrafi samodzielnie opracować renderowanie proceduralne, oceniać obraz, poprawiać błędy i optymalizować wynik do małego samodzielnego pliku HTML.

Eksperyment jest inspirowany sposobem pracy z projektu *Abyssal Garden*, ale wszystkie sceny, algorytmy, nazwy i rozwiązania mają stanowić oryginalną realizację.

## 2. Wizja artystyczna

- **Miejsce:** ECHO-9 — dawno opuszczona stacja badawcza na orbicie gazowego olbrzyma.
- **Ton:** monumentalny, melancholijny, tajemniczy; cisza przeplatana niskim mechanicznym pomrukiem.
- **Paleta:** atramentowy granat, chłodny cyjan i biel gwiazdy, akcenty bursztynowych i czerwonych świateł awaryjnych.
- **Moment „wow”:** wejście do olbrzymiego obserwatorium; za panoramicznymi oknami dominuje ogromna planeta z widocznymi pasmami atmosfery, fragmentem pierścieni i powolnym ruchem cieni.
- **Efekty:** promienie światła w drobinach kurzu, unoszące się szczątki, migotanie instalacji, lokalne iskry, rozproszone odbicia na metalowych powierzchniach.

## 3. Układ świata

1. **Obserwatorium:** wysoka kopuła, panoramiczne okna, mostki, panele sterowania, planetarny widok. Scena priorytetowa pod względem jakości.
2. **Korytarz serwisowy:** węższa przestrzeń z rurami, kablami, śluzami, awaryjnym oświetleniem i detalami podkreślającymi skalę.
3. **Hangar:** ogromna hala, dźwigary, maszyny, fragmenty pojazdów i unoszące się w nieważkości elementy.

Przejścia między sektorami muszą być ciągłe. Świat jest ograniczony, lecz granice nie powinny psuć pierwszego wrażenia. Bez zadań, walki i pełnej symulacji fizyki w pierwszej wersji.

## 4. Technologia i ograniczenia

- WebGPU i WGSL do grafiki; JavaScript i natywne API przeglądarki do logiki i sterowania.
- Bez Three.js, Babylon.js, Unity, Unreal lub innych silników 3D w czasie działania.
- Brak zewnętrznych modeli, tekstur, czcionek, nagrań i innych zasobów runtime. Geometria i materiały są proceduralne; synteza dźwięku przez Web Audio API.
- Końcowy artefakt: jeden samodzielny `index.html`, działający offline w zgodnej przeglądarce. Czytelny kod źródłowy i narzędzia developerskie pozostają w repozytorium.
- Powtarzalna generacja na podstawie ustalonego ziarna losowości (seed).
- Prealokowane zasoby dla pętli renderowania; unikać alokacji JavaScript w każdej klatce i kosztownych operacji synchronizujących CPU/GPU.
- Prosta kolizja z podłogami i dużymi przeszkodami; nie wymaga się kolizji każdego drobnego obiektu.
- Sensowne poziomy jakości `Low`, `Medium`, `High`; domyślnie skupienie na desktopowym Chrome/Edge z WebGPU.

## 5. Interakcja

- `WASD`: ruch poziomy; mysz: kierunek patrzenia z pointer lock.
- `Q`/`E`: ruch w dół i w górę; `Shift`: szybsze przemieszczanie.
- `Esc`: menu; `1`–`6`: sześć zapisanych pozycji kamery.
- `M`: dźwięk; `H`: statystyki wydajności.
- Przygotować stałą, 60-sekundową trasę przelotu do testów i nagrania (tryb developerski).
- Komunikat przy braku WebGPU; brak cichej awarii.

## 6. Priorytety i budżety

Kolejność priorytetów przy konfliktach:

1. **Jakość wizualna** i czytelna kompozycja trzech sektorów.
2. **Stabilna płynność** oraz brak oczywistych artefaktów obrazu.
3. **Niezależność od zewnętrznych zasobów** i prostota dystrybucji.
4. **Minimalny rozmiar** pliku końcowego.

Wstępny cel wydajności: 60 FPS na uzgodnionej konfiguracji desktopowej przy 1920×1080 i ustawieniu `High`. Sprzęt referencyjny trzeba ustalić i zweryfikować przed uznaniem testu za rozstrzygający. 100 KB to **cel eksperymentalny (stretch goal)**, a nie warunek zakończenia pierwszej iteracji. Raportować rozmiar surowego HTML, a osobno rozmiar gzip — nie mieszać tych liczb.

## 7. Kontrola jakości

### Bramka A — poprawność

- `npm run build` bez błędów, wynikowy `index.html` jest samodzielny.
- `RunAllTests` (lub jawny alias `npm run test:all`) kończy się zielonym wynikiem.
- Testy obejmują co najmniej spójność buildu, brak odwołań do zewnętrznych zasobów, stabilność ziarna losowości i podstawowe funkcje pomocnicze.
- Ręczny smoke test: start, kontrola kamery, przejścia między trzema sektorami, menu i obsługa braku WebGPU.

### Bramka B — obraz

- Sześć z góry określonych widoków, w tym obserwatorium, planeta w oknie, korytarz serwisowy i hangar.
- Niezależny krytyk wizualny dostaje tylko obrazy i krótkie nagranie przelotu; nie dostaje kodu ani argumentacji autora.
- Krytyk ocenia kompozycję, geometrię, czytelność sceny, aliasing, migotanie, banding, popping, światło i spójność stylistyki.
- Wady powyżej poziomu `minor` należy usunąć lub zgłosić jako blokadę.

### Bramka C — wydajność

- Powtarzalny, 60-sekundowy przelot. Raport: średni, p99 i maksymalny czas klatki; czas GPU z timestamp queries, jeśli środowisko wspiera tę funkcję.
- Rejestrować rozdzielczość, poziom jakości, przeglądarkę, GPU i warunki pomiaru.
- Nie ogłaszać wyniku `60 FPS` ani zaliczenia bramki wizualnej bez realnego pomiaru na GPU i oceny faktycznych renderów.

## 8. Etapy dostawy

1. **M0 — zatwierdzenie:** wybór docelowego repozytorium, przeczytanie jego `AGENTS.md`, uzgodnienie sprzętu testowego i zakresu. Obecny dokument i prompt nie upoważniają jeszcze do implementacji.
2. **M1 — prototyp obrazu:** obserwatorium, planeta, kamera i podstawowe światło. Weryfikacja kierunku artystycznego.
3. **M2 — trzy sektory:** proceduralna geometria, oświetlenie, dźwięk, nawigacja, proste kolizje.
4. **M3 — pętla jakości:** sześć ujęć, niezależna recenzja wizualna, poprawki, rejestr wad.
5. **M4 — optymalizacja:** pomiary GPU i stabilności, presety jakości, minimalizacja WGSL/JS/CSS, raport rozmiaru.
6. **M5 — zamknięcie:** build → zielony `RunAllTests` → aktualizacja `AGENTS.md` i karty zadania → commit na `main` → `git push`, o ile operacje są zgodne z repozytorium, uprawnieniami i zatwierdzonym zakresem.

## 9. Ryzyka i założenia

- W środowisku bez sprzętowo przyspieszanego WebGPU nie można rzetelnie zamknąć bramek B i C; wtedy należy zgłosić blokadę i użyć zatwierdzonego środowiska GPU.
- 100 KB może wymagać kompromisów z jakością lub funkcjonalnością; wielkość pliku nie oznacza małego użycia RAM/VRAM.
- Jasna lista obiektów i widoków pomaga, ale nie gwarantuje oczekiwanego efektu bez iteracji i ludzkiego przeglądu.
- Żadnych zmian w obszarach zabronionych przez `AGENTS.md` bez odrębnej zgody.
- Zmiany w gałęzi `main` i wypchnięcie kodu nastąpią dopiero po odrębnej akceptacji implementacji oraz ustaleniu repozytorium.

## 10. Do decyzji Adriana przed implementacją

1. Czy tworzymy nowe repozytorium `project-echo-9`, czy pracujemy w istniejącym? Jeśli istniejącym — potrzebny jego adres.
2. Czy akceptujesz desktop-first i 100 KB jako cel dodatkowy, a nie twardy limit?
3. Na jakim sprzęcie docelowo mierzymy płynność (lub czy przyjmujemy najpierw dostępne środowisko GPU)?



</details>

<details><summary>Prompt wykonawczy</summary>

# PROJECT ECHO-9 — prompt wykonawczy dla Codexa

**Status:** DRAFT — do uruchomienia dopiero po zatwierdzeniu specyfikacji i środowiska.

## Rola i misja

Jesteś agentem inżynierii grafiki czasu rzeczywistego. Zbuduj oryginalną, eksplorowalną scenę 3D opuszczonej stacji orbitalnej ECHO-9 w pojedynczym pliku HTML. Wykorzystuj narzędzia Codexa do uruchamiania aplikacji, testowania, analizowania renderów i iteracyjnego poprawiania rezultatu. Nie uznawaj zadania za wykonane na podstawie samego faktu, że kod się kompiluje.

## Zasady współpracy i repozytorium

1. Przed jakąkolwiek implementacją przeczytaj `AGENTS.md` w docelowym repozytorium i przestrzegaj jego zasad. Nie zmieniaj obszarów zabronionych bez wyraźnej zgody Adriana.
2. Przed zmianami pokaż plan, ustal zakres i poczekaj na osobną akceptację. Ten prompt nie jest sam w sobie zgodą na modyfikację repozytorium.
3. Zachowaj istniejące zmiany użytkownika; nie stosuj destrukcyjnych operacji Git.
4. Dla zatwierdzonego zadania zamknij cykl: build → zielony `RunAllTests` → aktualizacja `AGENTS.md` i karty → commit na `main` → `git push`. Jeśli któryś krok jest niemożliwy lub wymaga nowej zgody, zatrzymaj się i opisz blokadę; nie zgłaszaj niezweryfikowanego sukcesu.

## Priorytety przy konfliktach

1. Jakość wizualna i spójność artystyczna.
2. Stabilne renderowanie i płynność.
3. Samodzielność pliku końcowego.
4. Rozmiar pliku; 100 KB traktuj jako ambitny cel dodatkowy, nie jako pretekst do zepsucia sceny.

## Ograniczenia techniczne

- Użyj WebGPU i WGSL; bez Three.js, Babylon.js, Unreal, Unity i innych silników lub bibliotek 3D w czasie działania.
- Wszystko generuj proceduralnie; brak zewnętrznych plików tekstur, modeli, obrazów, nagrań i fontów w artefakcie runtime.
- Końcowy plik `index.html` powinien działać offline w Chrome/Edge z WebGPU. Osobne, czytelne moduły źródłowe i skrypt budowania są dozwolone.
- Użyj zdeterminowanego generatora pseudolosowego; powtarzalny seed świata i pozycji kamery.
- Alokacje i bufory inicjalizuj przed pętlą klatek; unikaj per-frame JS allocations i niepotrzebnej synchronizacji CPU/GPU.
- Zaimplementuj kontrolowane zużycie pamięci GPU; nie ukrywaj problemów wydajności przez zmianę skali renderowania bez raportu.
- Syntezuj dźwięk na żywo przez Web Audio API; dźwięk wymaga interakcji użytkownika przed startem.

## Wizja sceny

ECHO-9 to monumentalna, opuszczona stacja badawcza orbitująca wokół gazowego olbrzyma. Nastrój: melancholia, bezruch i skala. Dominują granaty, cyjan, miękka biel i oszczędne czerwone/bursztynowe światła awaryjne.

Zbuduj trzy płynnie połączone sektory:

1. **Obserwatorium:** centralny moment zachwytu; ogromna kopuła z panoramicznymi oknami, gigantyczna planeta z pasmami atmosfery i fragmentem pierścieni; głębia, volumetric-looking rays, odbicia, subtelna mgła, stanowiska badawcze.
2. **Korytarz serwisowy:** wąskie przejścia, moduły techniczne, panele, przewody, śluzy, pulsujące oświetlenie i unoszący się pył.
3. **Hangar:** wielka hala, szkielety maszyn, dźwigary, fragmenty niewielkich pojazdów, dryfujący złom i cienie podkreślające skalę.

Wrażenie przestrzeni jest ważniejsze niż liczba obiektów. Unikaj płaskich, pustych sal, agresywnego bloom, powtarzalnych elementów i widocznych granic świata. Nie dodawaj walki, misji ani pełnej fizyki w pierwszej iteracji.

## Sterowanie i diagnostyka

- `WASD` — ruch poziomy; mysz — obracanie kamery z pointer lock; `Q`/`E` — dół/góra; `Shift` — przyspieszenie.
- `Esc` — menu; `1`–`6` — sześć stałych ujęć testowych; `M` — wyciszenie; `H` — statystyki.
- Dodaj prostą kolizję kamery z podłogami, ścianami i kluczowymi konstrukcjami.
- Tryb developerski: powtarzalny, 60-sekundowy przelot przez wszystkie trzy sektory, zbierający statystyki.
- Dodaj czytelne ostrzeżenie, gdy WebGPU jest niedostępne.

## Weryfikacja wizualna — obowiązkowa bramka

Jeżeli system zapewnia możliwość pracy subagentów, utwórz niezależnego krytyka wizualnego. Krytyk otrzymuje **wyłącznie** sześć obrazów 1920×1080 ze stałych pozycji kamery i krótkie nagranie przelotu, bez kodu, promptów naprawczych i uzasadnienia autora. Ocenia:

- kompozycję, czytelność i głębię;
- spójność stylu i materiałów;
- światło, atmosferę i kolory;
- przenikanie geometrii, błędy perspektywy i znikające obiekty;
- aliasing, shimmering, popping, banding i niestabilną animację.

Krytyk zwraca uporządkowaną listę konkretnych defektów i ich wagę. Poprawiaj scenę i powtarzaj ocenę aż nie pozostaną wady powyżej `minor`. Nie twierdź, że bramka przeszła, jeśli nie wykonano renderów lub niezależnej recenzji.

## Weryfikacja wydajności — obowiązkowa bramka

Uruchom 60-sekundowy przelot na uzgodnionej konfiguracji GPU. Raportuj średni, p99 i maksymalny czas klatki oraz — jeśli funkcja jest dostępna — pomiary z GPU timestamp queries. Zapisz rozdzielczość, przeglądarkę, ustawienie jakości i kartę graficzną. Wstępny cel to 60 FPS w 1920×1080 przy `High` na uzgodnionym desktopie, nie zaś abstrakcyjne 60 FPS na każdym urządzeniu. Jeśli środowisko nie ma przyspieszanego WebGPU, oznacz test jako `BLOCKED`, a nie `PASS`.

## Zasady implementacji

- Najpierw stwórz działające obserwatorium i uzyskaj akceptację jego kierunku wizualnego.
- Rozbuduj korytarz i hangar bez utraty płynności.
- Dodaj proste `Low`, `Medium`, `High`; ograniczaj najpierw kosztowne efekty i gęstość detali, nie podstawową kompozycję.
- Minifikuj WGSL, JS i CSS dopiero po uzyskaniu jakości. Podaj surowy rozmiar wynikowego HTML i osobno gzip.
- Dokumentuj istotne kompromisy oraz elementy wymagające ręcznego testu.

## Kryteria ukończenia

Wynik zawiera: czytelne źródła, skrypt budowania, pojedynczy `index.html`, sześć ujęć kontrolnych, nagranie przelotu jeśli dostępne, raport wydajności, raport krytyka wizualnego, rozmiar pliku i zielony `RunAllTests`.

**Nie kończ zadania**, jeśli wymagana bramka nie została zweryfikowana. Zgłoś konkretnie: `PASS`, `FAIL` albo `BLOCKED`, przyczynę i bezpieczny następny krok. Raport do Adriana ma być krótki: co zrobiono, wyniki testów, odstępstwa od karty, ryzyka; na końcu wypisz zmiany w `AGENTS.md` i karcie albo „brak”.


</details>
