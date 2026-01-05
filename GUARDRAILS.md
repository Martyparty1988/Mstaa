# MST - GUARDRAILS & PREFLIGHT CHECKLIST

Tento dokument definuje **neporušitelná pravidla** architektury a logiky projektu MST (Marty Solar Tracker).
Jakákoli změna v kódu musí být ověřena proti tomuto seznamu.

---

## 1. DOMÉNOVÁ PRAVIDLA (MATH)

Tyto konstanty jsou pevně dané fyzikou panelů a strukturou projektu.

- **1 Panel** = 700 W
- **1 String** = 28 Panelů = 19.6 kWp
- **Výpočty výkonu:**
  - **SMALL (S)** = 1 String (19.6 kWp)
  - **MEDIUM (M)** = 1.5 Stringu (29.4 kWp)
  - **LARGE (L)** = 2.0 Stringy (39.2 kWp)

✅ **Checklist:**
- [ ] Všechny výpočty používají funkce z `domain/rules.ts` (např. `getStringsForSize`).
- [ ] Nikdy se nepočítá výkon "hardcoded" násobením v UI komponentách.

---

## 2. CHAT A KOMUNIKACE (STRICT)

Chat slouží **výhradně** pro lidskou komunikaci. Kvůli omezení Firebase Free Tier a čistotě UX platí tato omezení:

❌ **ZAKÁZÁNO:**
- **Systémové zprávy** (např. "Uživatel se připojil", "Stůl 2E01 dokončen").
- **Automatické logy** (Worklogy se nikdy nerenderují do chatu).
- **Obrázky a přílohy** (Žádné Binary/Base64 data, pouze text).
- **Notifikace** uvnitř konverzace.

✅ **POVOLENO:**
- Textové zprávy psané člověkem.
- Emojis.

✅ **Checklist:**
- [ ] Odesílací formulář neumožňuje vložit soubor.
- [ ] V komponentě `ChatConversation` není logika pro renderování systémových eventů.
- [ ] Chat `WorkLog` má vždy `durationMinutes: 0` a `type: HOURLY` (technická implementace).

---

## 3. FIELD MAP & EDITACE (UX)

Mapa slouží pouze pro výběr. Editace probíhá odděleně.

- **FieldMap (Grid):**
  - Slouží pouze pro výběr (`selection`).
  - Kliknutí (`tap`) vybírá/odznačuje stůl.
  - **NIKDY** nespouští přímou editaci stavu (např. double-tap to complete = zakázáno).
  - **NIKDY** neukládá data do `workLogs` přímo.

- **Action Bar & Overlay:**
  - Editace se spouští **pouze** přes Action Bar (tlačítko "Upravit").
  - Ukládání probíhá **pouze** v `FieldOverlay`.
  - `FieldOverlay` je jediné místo, kde vzniká nový `WorkLog` typu `TABLE`.

✅ **Checklist:**
- [ ] Kliknutí na stůl v mapě pouze mění `selectedIds`.
- [ ] Overlay se otevírá pouze pokud `selectedIds.size > 0`.
- [ ] Při zavření Overlay se výběr vyčistí (pokud není potvrzeno uložení).

---

## 4. TECHNICKÁ STRUKTURA

- **Mobile-First & iOS-First:**
  - UI prvky musí být dostatečně velké pro prst (min 44px touch target).
  - Používat `safe-area-inset` pro spodní a horní okraje (iPhone Notch/Home Bar).
  - Glassmorphism styl (Deep Ocean).

- **Data Flow:**
  - `useAppEngine` je hlavní controller.
  - `domain/types.ts` je jediný zdroj pravdy pro datové modely.
  - Žádné "dočasné" typy v komponentách.

---

## 5. TESTOVACÍ SCÉNÁŘE (MANUÁLNÍ)

Před každým commitem ověřit:

1. **Test Domény:**
   - [ ] Vytvořit stůl velikosti **L**.
   - [ ] Dokončit stůl.
   - [ ] Ověřit ve statistikách, že přibylo **39.2 kWp** a **2 stringy**.

2. **Test Chatu:**
   - [ ] Otevřít chat.
   - [ ] Zkusit odeslat prázdnou zprávu (nesmí projít).
   - [ ] Zkontrolovat, že se v chatu neobjevují hlášky o dokončení stolu z bodu 1.

3. **Test Editace:**
   - [ ] Vybrat 3 stoly.
   - [ ] Otevřít Overlay.
   - [ ] Změnit velikost jednoho stolu v Overlay.
   - [ ] Uložit jako "HOTOVO".
   - [ ] Ověřit, že se stoly v mapě přebarvily na zelenou.
