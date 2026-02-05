# HR Exam Cards Import - Anleitung

## Was wurde erstellt?

### 1. Lernmaterialien ✅
- **`public/HR_LERNZETTEL.md`** - Kompletter Lernzettel mit allen Themen (70+ Seiten)
- Strukturiert nach Priorität (High/Medium/Low)
- Mit Beispielen aus dem Mock Exam
- 2-Tage-Lernplan inklusive

### 2. Flashcards für die App ✅
- **`scripts/import-hr-exam-cards.sql`** - 70 Cards als SQL
- 52 Flashcards (basic)
- 18 Multiple-Choice Cards
- Alle mit Tags: 'hr', 'exam' + spezifische Tags

### 3. Import-Scripts
- **`scripts/import-hr-exam-cards.sql`** - Haupt-SQL-Datei
- **`scripts/insert-hr-cards-direct.mjs`** - Node.js Import-Script

---

## 📊 Card-Übersicht (70 Cards total)

### HIGH PRIORITY (27 Cards)
- **Kotter's 8 Steps:** 8 Flashcards + 2 MC = 10 Cards
- **Organization Archetypes:** 6 Flashcards + 3 MC = 9 Cards
- **Gender Equality:** 7 Flashcards + 2 MC = 9 Cards

### MEDIUM PRIORITY (9 Cards)
- **Personnel Planning:** 3 Flashcards + 1 MC = 4 Cards
- **Leadership Models:** 7 Flashcards + 2 MC = 9 Cards
- **Span of Control:** 3 Flashcards + 1 MC = 4 Cards

### LOW PRIORITY (34 Cards)
- **Cognitive Biases:** 4 Flashcards + 1 MC = 5 Cards
- **Reiss Profile:** 2 Flashcards = 2 Cards
- **Cross-Cultural:** 3 Flashcards + 1 MC = 4 Cards
- **Teamwork:** 2 Flashcards + 1 MC = 3 Cards
- **Organizational Theory:** 2 Flashcards + 1 MC = 3 Cards
- **Personnel Selection:** 2 Flashcards + 1 MC = 3 Cards
- **Employer Branding:** 2 Flashcards = 2 Cards

---

## 🚀 IMPORT-OPTIONEN

### Option 1: Supabase Dashboard (EMPFOHLEN - Am einfachsten!)

1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Klicke auf **SQL Editor** im linken Menü
4. Klicke auf **"+ New query"**
5. Kopiere den kompletten Inhalt von `scripts/import-hr-exam-cards-fixed.sql`
6. Füge ihn ein und klicke auf **"Run"**
7. ✅ Done! Alle 70 Cards sind importiert

**Hinweis:** Die Fixed-Version enthält leere `back`-Felder für Multiple-Choice-Cards, da die Datenbank dies erfordert.

**Vorteile:**
- Einfach und schnell
- Kein Terminal nötig
- Visuelles Feedback

---

### Option 2: Node.js Script (Für Entwickler)

**Voraussetzungen:**
- Node.js installiert
- `.env.local` mit Supabase Credentials

**Schritte:**

```bash
# 1. Terminal öffnen und ins Projekt-Verzeichnis
cd /Users/chris/Documents/Privat/Studium/lernapp

# 2. Dependencies installieren (falls noch nicht geschehen)
npm install @supabase/supabase-js

# 3. Import-Script ausführen
node scripts/insert-hr-cards-direct.mjs
```

**Was das Script macht:**
- Liest alle 70 Cards aus der Definit

ion
- Fügt sie einzeln in die Datenbank ein
- Zeigt Progress (✓ Card 1/70 inserted...)
- Gibt Summary am Ende

---

### Option 3: psql (PostgreSQL CLI)

Falls du direkten DB-Zugriff hast:

```bash
# 1. SQL-Datei ausführen
psql "postgresql://[your-connection-string]" -f scripts/import-hr-exam-cards.sql

# 2. Überprüfen
psql "postgresql://[your-connection-string]" -c \
  "SELECT COUNT(*) FROM cards WHERE 'exam' = ANY(tags);"
```

---

## ✅ Nach dem Import überprüfen

### In der App:
1. Öffne die Lernapp: http://localhost:3000
2. Gehe zu "Human Resources and Organisation"
3. Klicke auf "Lernen"
4. Du solltest jetzt 70 neue Cards sehen (30 alte + 70 neue = 100 total)

### Im Supabase Dashboard:
```sql
-- Alle HR Cards zählen
SELECT COUNT(*) FROM cards
WHERE subject_id = 'f1c31287-e2d3-4981-ae57-717a34d7551c';

-- Nur Exam Cards zählen
SELECT COUNT(*) FROM cards
WHERE subject_id = 'f1c31287-e2d3-4981-ae57-717a34d7551c'
AND 'exam' = ANY(tags);

-- Nach Typ gruppieren
SELECT card_type, COUNT(*)
FROM cards
WHERE subject_id = 'f1c31287-e2d3-4981-ae57-717a34d7551c'
AND 'exam' = ANY(tags)
GROUP BY card_type;
```

**Erwartetes Ergebnis:**
- `basic`: 52 Cards
- `multiple_choice`: 18 Cards
- **Total:** 70 Cards

---

## 🎯 Nächste Schritte

### 1. Import durchführen
Wähle Option 1 (Supabase Dashboard) und importiere die Cards

### 2. Lernzettel nutzen
Öffne `public/HR_LERNZETTEL.md` in einem Markdown-Viewer oder direkt in VS Code

### 3. Lernen starten!
- **Tag 1 (Heute):** HIGH PRIORITY Themen (Kotter, Org Archetypes, Gender Equality)
- **Tag 2 (Morgen):** LOW PRIORITY + Mock Exam

### 4. Mit der App lernen
- Normale Study-Session für Flashcards
- Exam-Mode für 20 zufällige Fragen unter Zeitdruck

---

## 🔧 Troubleshooting

### "Error: duplicate key value violates unique constraint"
**Lösung:** Cards wurden bereits importiert. Überspringe den Import oder lösche die alten Cards erst:

```sql
-- ACHTUNG: Löscht ALLE Exam-Cards! Nur verwenden wenn du neu starten willst
DELETE FROM cards
WHERE subject_id = 'f1c31287-e2d3-4981-ae57-717a34d7551c'
AND 'exam' = ANY(tags);
```

### "Error: relation 'cards' does not exist"
**Lösung:** Falsche Datenbank ausgewählt. Stelle sicher, dass du die richtige Supabase-Projekt-Connection verwendest.

### "Missing Supabase credentials"
**Lösung:** Füge in `.env.local` hinzu:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## 📈 Feature-Ideen für später

Wenn du mehr Zeit hast, könntest du noch hinzufügen:

1. **Lernzettel als PDF exportieren**
   - Verwende `mdpdf` oder `markdown-pdf`

2. **Exam-Modus erweitern**
   - Nach Priorität filtern (nur HIGH/MEDIUM)
   - Nach Themen filtern (nur Kotter, nur Gender Equality)

3. **Zusammenfassungs-Cards**
   - Kompakte "Cheat Sheet" Cards mit nur den Kernpunkten

4. **Audio-Cards**
   - Text-to-Speech für Lernen unterwegs

---

## 💾 Backup

Die original SQL-Datei ist gesichert unter:
```
scripts/import-hr-exam-cards.sql
```

Falls du sie nochmal brauchst, ist sie immer da! ✅

---

**Viel Erfolg beim Lernen! 🚀**
