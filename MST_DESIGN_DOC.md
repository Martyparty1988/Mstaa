# MST – Design & Architecture Document

## 1. Přehled aplikace
MST (Marty Solar Tracker) je navržena jako **"Construction-First" PWA**. Odstraňuje veškerou administrativní zátěž z pracovníka v terénu. UI je postaveno na principu "Big Thumb" (velká tlačítka, ovládání palcem) a vizuální zpětné vazbě.

## 2. Režim Mapa & Výběr (FieldMap)
Základní princip: **Mapa jen ukazuje, Bottom Sheet řeší.**

*   **Interakce:**
    *   Tap = Vybrat stůl (toggle).
    *   Long Press = Aktivovat výběr / Přidat do výběru.
    *   Klik do prázdna = Zrušit výběr.
*   **Bottom Sheet (Pracovní panel):**
    *   Zobrazí se automaticky při výběru > 0.
    *   **Sekce 1 (Kdo):** Rychlý přepínač pracovníka (Já / Tým).
    *   **Sekce 2 (Kdy):** Presety pracovní doby (7-17, 60m...). Žádné časy v hlavičce mapy.
    *   **Sekce 3 (Akce):** Hotovo / Rozdělané / Problém.
*   **Režim A (Flexi):**
    *   Po kliknutí na "HOTOVO" se panel změní na výběr velikosti (S/M/L).
*   **Režim B (Strict):**
    *   Po kliknutí na "HOTOVO" se ihned ukládá.

## 3. Entity a Vztahy
*   **TableStatus:** `PENDING` | `IN_PROGRESS` | `DONE` | `ISSUE`.
*   **WorkLog:** Podporuje `tableIds` (pole) pro hromadné ukládání.

## 4. Flow Běžného Dne
1.  **Dashboard:** Rychlý přehled "Dnes" a tlačítko "Pokračovat".
2.  **Mapa:** Pracovník označí 5 stolů (long press + tap tap tap).
3.  **Akce:** Zkontroluje "Já" a "7-17", klikne na "HOTOVO".
4.  **Hotovo:** Stoly zezelenají, výběr zmizí.

## 5. UX Principy
*   **Safe Area:** Respektování iOS Home Indicatoru v Bottom Sheetu.
*   **Haptic Feedback:** Vibrace při Long Pressu a Uložení.
