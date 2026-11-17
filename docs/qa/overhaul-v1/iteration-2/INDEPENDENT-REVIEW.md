# Niezależna recenzja wizualna — iteracja 2

## Werdykt

**Reference-match: FAIL.** Wynik trafnie przywołuje przemysłowy korytarz science fiction oraz podział na chłodniejszy przód i czerwone wnętrze. Nie osiąga jednak jakości artystycznej referencji w opracowaniu materiałów, subtelności światła, skali detalu i atmosferycznym rozdzieleniu głębi. Widoczne różnice są istotne także przy ocenie ogólnych mas obrazu, a nie tylko przy oglądaniu szczegółów.

To ocena zgodności obrazu z referencją, nie odrzucenie projektu jako samodzielnej, bardziej stylizowanej propozycji. Raport nie stanowi akceptacji artystycznej w imieniu właściciela.

## Zakres i metoda

Oceniono wyłącznie trzy pełne pliki otwarte przez `view_image`:

- Referencja: `/workspace/project-echo-9/docs/references/target-red-corridor.jpg`.
- Wynik bez HUD: `/workspace/project-echo-9/docs/qa/overhaul-v1/iteration-2/after-clean.png`.
- Wynik z HUD: `/workspace/project-echo-9/docs/qa/overhaul-v1/iteration-2/after-hud.png`.

Nie czytano kodu, pozostałych dokumentów, historii projektu ani uzasadnień autorów. Nie zmieniano sceny ani obrazów. Wnioski dotyczą wyłącznie widocznego efektu; nie przypisują go określonym mechanizmom renderera. Ocena czytelności w miniaturze dotyczy układu dużych mas tonalnych i kolorystycznych widocznego w dostarczonym obrazie, bez generowania dodatkowych wersji plików. Stille nie pozwalają potwierdzić wydajności, stabilności obrazu w ruchu, jakości animacji ani interakcji.

Obszary podano jako przybliżone procenty szerokości i wysokości kadru, licząc od lewego górnego rogu. `Critical` oznacza wadę zasadniczo uniemożliwiającą ocenę lub burzącą cały obraz; `major` — istotną przeszkodę w zgodności z referencją; `minor` — lokalną lub drugorzędną różnicę.

## Ocena porównawcza

| Aspekt | Obserwacja |
| --- | --- |
| Kompozycja i skala | Oba obrazy prowadzą w głąb po lewej stronie i używają ciemnej prawej ściany jako ramy. W wyniku podłoga z dużymi poprzecznymi podziałami, grube rury i jasny pion ściany silnie dominują pierwszy i środkowy plan. Referencja ma subtelniejszą, drobniej opracowaną architekturę, wyraźniejszy ośmioboczny rytm przekrojów oraz dłuższą wizualnie drogę prowadzącą do zamglonego zakończenia. Wynik jest bardziej ciasny i demonstracyjnie geometryczny. |
| Hierarchia chłodnego i czerwonego światła | Podział kolorystyczny jest czytelny. W referencji chłodne światło wydobywa wybrane powierzchnie, a czerwień pojawia się w lampach, odbiciach i głębi. W wyniku prawy środkowy pion staje się szeroką niemal białą powierzchnią, a czerwień tworzy mocne, rozległe pola na lewej ścianie i podłodze. Dwa jasne obszary konkurują ze sobą zamiast tworzyć podobnie powściągliwą hierarchię. |
| Trzy plany w miniaturze | Da się wskazać ciemną prawą ramę i bliskie rury, jasny chłodny środek oraz czerwony dalszy odcinek. To mocna podstawa kompozycyjna. Środkowy i daleki plan zlewają się jednak miejscami w jeden czerwony obszar, a rytm jasnych podziałów podłogi konkuruje z kierunkiem w głąb. Referencja wyraźniej oddziela bliski ciemny próg, przestrzenny środek i miękkie, zamglone zakończenie. |
| Materiały i odbicia | Metal jest rozpoznawalny dzięki pasmom połysku na rurach i kratach. Powierzchnie są jednak zbyt jednolite, gładkie i regularne względem referencji. W referencji refleksy są przerywane, zróżnicowane i osadzone w bogatszej fakturze; w wyniku dominują ciągłe srebrne pasy oraz duże płaszczyzny o małej zmienności. |
| Widoczne cienie | Ciemne wnęki, opaski rur i ostre ukośne granice światła na lewej ścianie są widoczne. Nie jest to obraz pozbawiony cieni. Zestawienie bardzo czarnych pól z silnie oświetlonymi panelami jest jednak bardziej graficzne niż w referencji. Drobne elementy na jasnej prawej ścianie słabiej przekazują ciężar i głębokość przez lokalne zacienienie. |
| Atmosfera | Czerwone światło, chłodna smuga u góry oraz drobne punkty w powietrzu budują klimat. Referencja ma bardziej spójną mglistą głębię i mniej dosłowne zakończenie korytarza. W wyniku daleka geometria pozostaje dość twarda i czytelna wewnątrz czerwonej poświaty, a górna smuga światła jest osobnym, wyrazistym efektem. |
| Jakość obrazu | Wynik jest czytelny i nie wykazuje oczywistego uszkodzenia całego kadru. Regularność krawędzi, połysku i detalu daje jednak wyraźnie bardziej syntetyczny charakter. Drobne ząbkowane akcenty na kratownicach oraz jasne punkty w powietrzu miejscami odciągają uwagę. Ze stilli nie można rozstrzygnąć, jak zachowują się w ruchu. |
| Wpływ HUD | HUD ma spójną, lekką typografię i pozostawia czerwony cel kompozycyjny odsłonięty. Duży napis „SERVICE SPINE” w lewym dolnym rogu staje się dodatkowym punktem skupienia, a przyciemnienia na górze i dole maskują część powierzchni sceny. Nakładka poprawia prezentację produktu, ale nie poprawia zgodności samej sceny z referencją. |

## Konkretne wady

Nie stwierdzono wady kategorii **critical** na podstawie tych trzech obrazów. Werdykt FAIL wynika z kilku niezależnych wad kategorii major.

| Waga | Obszar wyniku | Wada i jej skutek |
| --- | --- | --- |
| **major** | Prawa środkowa ściana: x 38–51%, y 12–68%; bliskie rury: x 36–62%, y 53–100%; podłoga: x 0–36%, y 59–100% | Zbyt gładkie i jednolite materiały oraz długie regularne pasma połysku. Duże powierzchnie przypominają czyste, proste elementy modelu zamiast ciężkiego, używanego metalu z referencji. To jeden z głównych powodów różnicy poziomu wiarygodności. |
| **major** | Jasna prawa ściana: x 38–51%, y 11–66%; czerwony odcinek: x 10–37%, y 34–65% | Zbyt twarda konkurencja szerokiej chłodnej bieli z nasyconą czerwienią. Referencja utrzymuje bogatsze półtony i pozwala czerwieni prowadzić przez odbicia; wynik dzieli scenę na bardziej płaskie bloki barwne. |
| **major** | Podłoga i konstrukcja: x 0–43%, y 52–100%; sufit: x 0–40%, y 0–38% | Duże powtarzalne poprzeczki i jasne krawędzie przejmują kompozycję. Skala detalu oraz wizualna dominacja regularnego rytmu osłabiają wrażenie rozbudowanej, ciężkiej architektury obecne w referencji. |
| **major** | Głębia korytarza: x 20–36%, y 37–58% | Dalszy odcinek jest czerwonym, stosunkowo twardo zarysowanym zamknięciem. Brakuje równie przekonującego przejścia od czytelnego środka do miękkiego, niejednoznacznego końca, przez co przestrzeń wydaje się płytsza. |
| **major** | Lewa ściana: x 10–26%, y 39–55%; jasny prawy pion: x 39–51%, y 27–65% | Cienie i przejścia światła mają nierówną siłę: po lewej ostre, rozległe odcięcia, po prawej bardzo gładkie rozświetlenie z mało wyrazistym lokalnym zacienieniem przy mniejszych detalach. Osłabia to spójność ciężaru i osadzenia elementów. |
| **minor** | Prawa część: x 63–100%, y 0–100% | Duży niemal czarny obszar ma skromną czytelność materiału. Ciemna prawa rama jest zgodna z kierunkiem referencji, lecz tutaj długa seria prostych poziomych listew nie daje równie bogatej sylwety i subtelnych śladów powierzchni. |
| **minor** | Górny środek: x 35–50%, y 0–26%; rozproszone punkty po lewej i w środku | Jasna smuga i punktowe akcenty w powietrzu bywają bardziej zauważalne jako pojedyncze efekty niż jako część jednolitej atmosfery. Nie można określić ich zachowania czasowego na podstawie stilli. |
| **minor** | HUD: x 2–25%, y 80–91%; pasy przy górnej i dolnej krawędzi | Duży tytuł i przyciemnienia przesuwają uwagę ze sceny na oprawę. Nakładka pozostaje czytelna i nie zasłania głębi, ale wariant HUD nie powinien zastępować oceny clean. Najmniejsze etykiety są mało czytelne przy zmniejszonym podglądzie. |

## Mocne strony

- Rozpoznawalny temat i kierunek artystyczny: zamknięty korytarz techniczny, rury, kraty, segmentowa konstrukcja oraz czerwony sygnał w głębi.
- Celowo niesymetryczny kadr z osią przejścia po lewej oraz ciemnym prawym obramowaniem; ten ogólny układ nawiązuje do referencji.
- Czytelny kontrast chłodnego światła blisko obserwatora i czerwonego dalszego odcinka.
- Bliskie rury i ramy budują perspektywę, a powtarzalna konstrukcja daje czytelny kierunek przemieszczania się.
- Występują widoczne cienie, odbicia oraz elementy atmosfery; obraz ma już podstawy przestrzenności i nastroju.
- HUD jest oszczędny, uporządkowany i spójny z tematyką stacji. Najważniejsza część korytarza pozostaje odsłonięta.

## Co pozostaje do decyzji właściciela

1. Czy obowiązuje dalsze zbliżanie się do ciemnego, zużytego, filmowego realizmu referencji, czy dopuszczalna jest obecna, wyraźnie gładsza i bardziej graficzna stylistyka. Obecny wynik może być oceniany jako osobny kierunek, lecz nie powinien otrzymać PASS zgodności z tą referencją.
2. Czy proporcja dużej ciemnej prawej ramy do właściwej przestrzeni przejścia jest pożądana w docelowej prezentacji. Sama obecność tej ramy nie jest błędem; jej dzisiejsza prostota i duży udział mają koszt kompozycyjny.
3. Jak silnie HUD ma uczestniczyć w odbiorze sceny: jako dyskretna informacja czy dodatkowy główny element graficzny. Obecny duży tytuł świadomie zmienia hierarchię kadru.
4. Czy wynik po poprawkach materiałów, rozkładu światła i głębi spełni zamierzoną jakość artystyczną. Ostateczna akceptacja należy do właściciela i nie wynika z tego raportu.

Największą poprawę zgodności przyniosłoby osłabienie jednolitej bieli na środkowej prawej ścianie, zróżnicowanie odpowiedzi materiałów i odbić oraz wyraźniejsze atmosferyczne oddzielenie końca korytarza. Jest to wskazanie pożądanego efektu obrazu, nie zalecenie konkretnej implementacji renderera.
