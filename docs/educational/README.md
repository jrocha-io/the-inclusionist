# educational/ — camada de currículo e pedagogia (pt-BR, domínio)

A **camada currículo** do modelo de duas camadas (ver `../../CONTRIBUTING.md`). Aqui vive o **conteúdo pedagógico** —
*o que* se aprende, por quem, em que ordem, e como se prova o domínio. Software e mecânica de jogo ficam em
`../1-Discovery/` e no código; **aqui não entra software**.

Escrita em **pt-BR** por natureza (BNCC, alfabetização, fundamentos pedagógicos são conteúdo brasileiro).

Decisão de governança: **[ADR-0004](../2-Architecture/adr/ADR-0004-educational-documentation-subset.yaml)** (quais
artefatos educacionais adotamos/adiamos/rejeitamos).

## Artefatos

- **[Learning-Objectives.md](Learning-Objectives.md)** — objetivos de aprendizagem mensuráveis (código BNCC + Mager:
  comportamento · condição · grau). O núcleo verificável (aaa-threshold).
- **[Curriculum-Map.md](Curriculum-Map.md)** — mapa de currículo / escopo e sequência (Jacobs): cobertura de
  habilidades por etapa (infantil · fundamental · médio), alinhada à BNCC. Responde "toda habilidade da BNCC do 1º ano
  tem jogo/atividade?".
- **[Pedagogical-Model.md](Pedagogical-Model.md)** — modelo pedagógico / teoria de aprendizagem que rege o design
  (psicogênese de Ferreiro & Teberosky na alfabetização; domínio/mastery; repetição espaçada; ZPD).
- **Planos educacionais por domínio** — os *blueprints* (IDD em prosa) de cada conjunto de atividades:
  - **[plano-alfabetizacao.md](plano-alfabetizacao.md)** ✅ (Ferreiro & Teberosky, 6 jogos) — já migrado.
  - matemática, … — a criar/migrar.

> As **features Gherkin** de aceite das atividades ficam em `../3-Sprint-Design/bdd/` (artefato de teste), mas
> **referenciam** os objetivos daqui pelo código BNCC.
