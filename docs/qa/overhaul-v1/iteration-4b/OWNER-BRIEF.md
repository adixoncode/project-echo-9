# PROJECT ECHO-9 — CINEMATIC QUALITY BREAKTHROUGH

## ROLA I MISJA

Jesteś głównym Creative Directorem, Technical Artistą i Senior Graphics Programmerem projektu PROJECT ECHO-9.

Twoim zadaniem jest doprowadzenie proceduralnego korytarza opuszczonej stacji kosmicznej do jakości wizualnej godnej profesjonalnego portfolio Creative Developera.

Nie interesuje mnie kolejna implementacja, która przechodzi wszystkie testy, ale wizualnie nadal przypomina przeciętną grę 3D.

**Najważniejszym celem jest obraz.**

Chcę poczuć atmosferę opuszczonej stacji kosmicznej: ciężar metalowej konstrukcji, wieloletnie zużycie, samotność, czerwone światła awaryjne, chłodne refleksy, głębokie cienie i przestrzeń znikającą w atmosferycznej mgle.

Obraz ma wyglądać filmowo, a nie jak demonstracja techniczna WebGPU.

Nie obiecuj jakości, której nie potwierdzają rzeczywiste rendery.

## 0. OBOWIĄZKOWA ANALIZA PRZED IMPLEMENTACJĄ

Najpierw przeczytaj w całości:

1. `AGENTS.md`
2. Issue #1, #2, #3 i #4
3. Aktualny kod renderera, korytarza, materiałów, świateł i postprocessingu.
4. Raporty i rzeczywiste rendery Iteracji 3 oraz 4A.
5. Wszystkie referencje z `docs/references/`, w szczególności `target-red-corridor.jpg`.

Następnie zbadaj dwa projekty:

### Abyssal Garden

https://github.com/Noniv/abyssal-garden

Przeczytaj:

- `prompt.txt`
- `source/src/shaders.js`
- `source/src/world.js`
- `source/src/main.js`

Zidentyfikuj konkretne rozwiązania odpowiedzialne za:

- atmosferyczną głębię;
- absorpcję i rozpraszanie światła;
- wizualną gęstość świata;
- budowanie wieloplanowości;
- subtelne proceduralne szczegóły;
- czytelność sceny na różnych odległościach.

### Web Ocean

https://github.com/Noniv/web-ocean

Przeczytaj:

- `README.md`
- `js/wgsl/sky.js`
- `js/wgsl/ocean.js`
- `js/wgsl/post.js`
- `js/main.js`

Zbadaj:

- modelowanie światła i atmosfery;
- odbicia środowiskowe;
- reakcję powierzchni na światło;
- filtrowanie detali zależnie od odległości;
- HDR, bloom i AgX;
- organizację wieloetapowego renderowania.

Nie kopiuj bezmyślnie oceanicznych shaderów do wnętrza stacji kosmicznej.

Dla każdej istotnej techniki wskaż, czy należy ją:

1. wykorzystać;
2. zaadaptować do środowiska przemysłowego;
3. odrzucić jako nieodpowiednią.

**Ważne:** ECHO-9 ma już HDR, AgX, GGX, mapy cieni i rozpraszanie objętościowe. Najpierw sprawdź ich rzeczywiste działanie. Nie implementuj ponownie funkcji, które już istnieją.

Zachowaj wymagane informacje licencyjne dla kodu pochodzącego z innych projektów.

## 1. PRIORYTETY

Obowiązuje następująca kolejność:

1. **Jakość artystyczna i filmowa.**
2. Kompozycja, oświetlenie i czytelność przestrzeni.
3. Wiarygodność materiałów i konstrukcji.
4. Stabilność obrazu oraz wydajność.
5. Rozmiar pliku wynikowego.

Nie pogarszaj bezpieczeństwa, podstawowej funkcjonalności ani odtwarzalności projektu, ale nie traktuj opcjonalnego limitu 100 KB jako przeszkody w osiągnięciu jakości wizualnej.

Nie uznawaj zaliczonych testów technicznych za dowód sukcesu artystycznego.

## 2. NAJWAŻNIEJSZA ZMIANA: KOMPOZYCJA PRZED KODEM

Dotychczasowa kamera hero nie jest już obowiązkowym kadrem końcowym.

Zachowaj jej ustawienia jako historyczną bazę porównawczą, ale pozwól sobie zaprojektować znacznie lepszą kompozycję.

Najpierw przygotuj co najmniej **cztery warianty ujęcia** istniejącego korytarza:

- ujęcie zbliżone do obecnego;
- ujęcie bardziej osiowe, z silną perspektywą;
- ujęcie asymetryczne, wzorowane kompozycyjnie na referencji;
- autorskie ujęcie zaproponowane przez Creative Directora.

Wykorzystaj zbliżoną wysokość oczu człowieka, ale eksperymentuj z położeniem kamery, FOV i kierunkiem patrzenia.

Wszystkie warianty przedstaw jako rzeczywiste obrazy z WebGPU, w identycznych warunkach technicznych.

Przygotuj też wersje neutralne, pozwalające ocenić samą geometrię.

**Nie rozpoczynaj kosztownego przebudowywania materiałów, dopóki nie znajdziesz kompozycji, która działa.**

### Kompozycja musi spełniać następujące warunki

- Pierwszy plan tworzy mocną ramę architektoniczną.
- Środkowy plan pokazuje grube żebra, instalacje i wnęki.
- Daleki plan ma rozpoznawalną sylwetkę kolejnego przejścia.
- Ciemna prawa strona nie może być niemal jednolitą, pustą bryłą.
- Nie ma wielkich płaszczyzn pozbawionych funkcji wizualnej.
- Wzrok widza naturalnie prowadzą linie konstrukcji, światło i perspektywa.
- Scena musi zachować czytelność po zmniejszeniu do 320 px szerokości.

Nie poprawiaj pustej bryły przez przypadkowe dodawanie ozdobników. Rozwiąż problem kompozycją i hierarchią geometrii.

## 3. SCENOGRAFIA: WIARYGODNA STACJA KOSMICZNA

Referencja `target-red-corridor.jpg` pozostaje głównym wzorcem kierunku artystycznego.

W szczególności chcę osiągnąć:

- masywne, wielowarstwowe ramy konstrukcyjne;
- zagłębione panele, wnęki i przestrzenie instalacyjne;
- grube rury, przewody, połączenia i mocowania;
- realistyczne przemysłowe kratownice i podłogi techniczne;
- funkcjonalnie uzasadnioną asymetrię;
- bogate detale średniej skali;
- wiarygodną skalę pomieszczenia;
- kontrolowaną nieregularność zamiast oczywistego kopiowania identycznych modułów.

Nie zwiększaj liczby obiektów tylko po to, aby scena wydawała się bardziej skomplikowana.

Każdy ważny element powinien pełnić funkcję konstrukcyjną, oświetleniową albo kompozycyjną.

## 4. ŚWIATŁO: NAJWAŻNIEJSZY ELEMENT FILMOWEGO WYGLĄDU

Po zaakceptowaniu najlepszego kadru przeprowadź świadomy lighting pass.

Chcę uzyskać trzy wyraźne warstwy:

**Pierwszy plan**

Ciemny, ale nie całkowicie czarny. Konstrukcja powinna być widoczna dzięki wąskim refleksom, światłu odbitemu i lokalnym kontrastom.

**Środkowy plan**

Chłodne światło wydobywające grubość ram, metaliczne powierzchnie, instalacje i krawędzie.

**Daleki plan**

Czerwone światło awaryjne, stopniowe rozpraszanie w atmosferze, malejący kontrast i wyraźna sylweta przejścia.

### Warunki obowiązkowe

- Czerwień nie może wyglądać jak ostry, jednolity trójkąt światła.
- Światło musi rzeczywiście oddziaływać na otaczające powierzchnie.
- Czerwone refleksy powinny być widoczne na podłodze, rurach i elementach konstrukcji.
- Cienie muszą odpowiadać geometrii i położeniu źródeł światła.
- Mgła ma budować głębię, a nie ukrywać niedopracowaną scenografię.
- Bloom ma być subtelny.
- Nie rozjaśniaj globalnie całej sceny tylko po to, żeby uzyskać więcej widocznych detali.
- Nie zepsuj naprawionego wcześniej problemu nagłego odcięcia czerwonego oświetlenia.

Przetestuj oddzielnie oświetlenie bez mgły, mgłę bez bloom i końcową kompozycję HDR.

Zachowaj prawidłową kolejność pracy w liniowej przestrzeni HDR, z jednym końcowym tonemappingiem.

## 5. MATERIAŁY: METAL, KTÓRY WYGLĄDA JAK METAL

Obecne materiały wyglądają zbyt czysto i syntetycznie.

Wymagam poprawy:

- lokalnej zmienności chropowatości;
- refleksów zależnych od rodzaju materiału;
- mikronierówności;
- zużycia odsłaniającego metal na krawędziach;
- zabrudzeń w zagłębieniach;
- zacieków wynikających z grawitacji i konstrukcji;
- otarć w miejscach użytkowania;
- różnicy między stalą, lakierowanym metalem, gumą i powierzchnią podłogi.

Zużycie musi wynikać z budowy obiektu. Losowy szum kolorystyczny nie jest wystarczającym rozwiązaniem.

Nie twórz nadmiernie mokrej, lustrzanej podłogi. Jeżeli dodasz wilgoć albo kondensację, musi być subtelna i uzasadniona.

Stosuj filtrowanie proceduralnych szczegółów, aby ograniczyć migotanie, morę i aliasing.

## 6. PRAWDZIWY PROCES ART DIRECTION

To jest kluczowy punkt.

Nie chcę kolejnego schematu:

`Implementacja → testy PASS → render → niezależna ocena FAIL → STOP`

Chcę procesu twórczego, w którym **obrazy decydują o kolejnych zmianach**.

Po zatwierdzeniu planu przeprowadź maksymalnie trzy wewnętrzne iteracje artystyczne w ustalonym zakresie:

1. Kompozycja i główne bryły.
2. Światło, atmosfera i hierarchia tonalna.
3. Materiały, detale i końcowy polish.

Po każdej iteracji wykonaj rzeczywiste rendery i niezależną ocenę obrazową.

Recenzent otrzymuje:

- oryginalną referencję;
- rzeczywisty render bez HUD;
- pomniejszenie do 320 px;
- odpowiednie zbliżenia, jeśli są potrzebne.

Nie otrzymuje kodu, raportów autora ani wyjaśnienia, co rzekomo zostało poprawione.

Recenzent ma wskazać konkretne widoczne różnice i określić ich wagę.

Jeżeli ocena wskazuje poważny problem kompozycyjny, nie przechodź do dopieszczania drobnych materiałów. Najpierw rozwiąż ten problem.

Nie powtarzaj tej samej poprawki pod inną nazwą.

## 7. KRYTERIA SUKCESU

Kandydat nadaje się do przedstawienia Adrianowi jako propozycja artystyczna, gdy:

- trzy plany przestrzeni są czytelne;
- w miniaturze widać konstrukcję i dalekie przejście;
- nie ma dużych, przypadkowo pustych obszarów;
- architektura ma przekonującą grubość i skalę;
- czerwone światło rzeczywiście buduje głębię;
- metaliczne powierzchnie mają zróżnicowane, wiarygodne refleksy;
- atmosfera wygląda spójnie;
- scena stylistycznie zbliża się do referencji;
- niezależny recenzent nie stwierdza usterek `critical` ani `major` w uzgodnionych kryteriach artystycznych.

Końcową ocenę estetyczną podejmuje Adrian.

**Nie ogłaszaj sukcesu wyłącznie na podstawie opinii modelu.**

Jeżeli po trzech iteracjach efekt nadal nie jest wystarczająco dobry, przedstaw uczciwy raport: co dokładnie odstaje od referencji, dlaczego oraz czy ograniczeniem jest architektura renderera, procedura generowania geometrii, brak dostępu do GPU lub przyjęte ograniczenia dotyczące assetów.

Nie ukrywaj porażki za technicznymi statusami PASS.

## 8. OCHRONA PROJEKTU I TESTY

Przestrzegaj aktualnego `AGENTS.md`.

Nie zmieniaj obserwatorium, hangaru ani ich wyglądu bez osobnej zgody.

Nie usuwaj istniejącej funkcjonalności nawigacji, kolizji, sześciu widoków i 60-sekundowego przelotu.

Nie oszukuj przez wyświetlanie statycznej referencji, podstawianie gotowego obrazu lub podmienianie geometrii wyłącznie w określonym ujęciu kamery.

Scena musi pozostać rzeczywistym, proceduralnym środowiskiem WebGPU/WGSL.

Wersja końcowa nadal ma być samodzielnym plikiem HTML działającym offline, bez zewnętrznych assetów runtime, chyba że Adrian osobno zatwierdzi zmianę tych ograniczeń.

Nie pomijaj regresji innych sektorów.

Wymagane:

- `npm run build`
- zielony `RunAllTests`
- smoke tests
- fallback tests
- kontrola kolizji i całej trasy
- kontrola pozostałych sektorów
- rzeczywiste rendery Full HD
- dokumentacja QA

Brak sprzętowego GPU oznacza `BLOCKED` dla sprzętowego FPS i oceny temporalnej. Nie deklaruj 60 FPS na podstawie SwiftShadera.

## 9. DOKUMENTACJA I PRZEKAZANIE

Zapisz:

- wszystkie kandydaty kompozycyjne;
- neutralne i produkcyjne rendery;
- porównania z referencją;
- miniatury 320 px;
- niezależne recenzje;
- uzasadnienie wyboru końcowego kadru;
- zmiany techniczne;
- wyniki testów;
- rozmiary HTML i gzip;
- ograniczenia oraz nierozwiązane problemy.

Po zatwierdzonej implementacji wykonaj:

`build → RunAllTests PASS → QA → AGENTS.md → Issue #4 → commit main → push`

Nie rozpoczynaj kolejnego, niezatwierdzonego etapu.

## 10. AUTORYZACJA — TERAZ TYLKO PLAN

Aktualne `AGENTS.md` zawiera STOP po etapie 4A.

Ten prompt jest zleceniem przygotowania planu nowego etapu 4B, a nie automatycznym zezwoleniem na zmianę kodu.

Najpierw przedstaw Adrianowi:

1. Co konkretnie wynika z analizy Abyssal Garden i Web Ocean.
2. Co w obecnym ECHO-9 najbardziej ogranicza jakość wizualną.
3. Które istniejące systemy można zachować, a które rzeczywiście trzeba zmienić.
4. Proponowaną strategię uzyskania filmowego kadru.
5. Zakres zmian w kamerze, geometrii, świetle i materiałach.
6. Ryzyka, kryteria odbioru i plan weryfikacji.

**Następnie STOP. Czekaj na wyraźne „ZATWIERDZAM” od Adriana.**

Po zatwierdzeniu możesz przeprowadzić opisane trzy wewnętrzne iteracje w uzgodnionym zakresie, z niezależną kontrolą wizualną i pełnymi testami.

Nie proponuj kolejnej kosmetycznej korekty.

**Celem jest prawdziwy przełom wizualny ECHO-9.**