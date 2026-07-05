# Data model — DBML

The database schema, written in **DBML** (text, diffable, renders to ER; `dbdiagram.io` / `dbml-cli`). One `.dbml`
block is the source of truth; this doc explains it.

## Why a DB (and when)

**Today:** a small hard-coded word list feeds the spelling/dictation activity — fine for a handful of words.
**Soon:** we move to a **linguistic corpus** where each word carries structured attributes — this is the trigger to
adopt a real DB (a growing, queryable, relational corpus is a poor fit for a pile of JSON/XML files).

A word (and later: sentence, text) links to **discipline**, **education stage** (infantil / fundamental / médio +
year), and holds: **syllabic division**, **phonetic transcription (IPA)**, part of speech, definition/description,
**example sentences**, difficulty, and frequency. Activities query the corpus by stage + attribute to pick what to
render.

## Schema (draft — grows with the corpus work)

```dbml
// DRAFT — validate when the corpus milestone starts. Star Schema only if/when an analytics warehouse appears.
Table word {
  id            integer   [pk, increment]
  lemma         varchar   [not null]
  syllables     varchar   // e.g. "ca-sa"
  ipa           varchar   // phonetic transcription
  pos           varchar   // part of speech
  definition    text
  difficulty    integer
  frequency     integer
}

Table discipline { id integer [pk]; name varchar }
Table stage      { id integer [pk]; segment varchar; year integer } // infantil|fundamental|medio + year

Table word_stage     { word_id integer [ref: > word.id]; stage_id integer [ref: > stage.id] }
Table word_discipline{ word_id integer [ref: > word.id]; discipline_id integer [ref: > discipline.id] }
Table example_sentence { id integer [pk]; word_id integer [ref: > word.id]; text text }
```

## Status

- [ ] Not the DB yet — current word list stays until the corpus milestone. Design here first, then migrate.
- Normalization / denormalization choices are recorded as **YADR ADRs** — see `Normalization.md`.
- Schema changes go through **migrations** — see `Migrations.md`.
