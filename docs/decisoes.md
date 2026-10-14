# Registro de Decisões — Hackathon Pop & Doce

<!-- Este arquivo registra as principais decisões técnicas da squad e suas justificativas. -->

## 1. Decisões técnicas

| Data | Decisão | Justificativa | Responsável | Status |
|---|---|---|---|---|
| 14/10/2026 | Utilizar Promptfoo como ferramenta principal na implementação inicial | Permitir avaliações automatizadas, assertions personalizadas e integração com a API | Kanan | Em uso; validar com a squad |
| 14/10/2026 | Separar o Golden Dataset em quatro arquivos YAML | Organizar os casos por integrante e reduzir conflitos de edição | Squad | Estrutura implementada |
| 14/10/2026 | Executar inicialmente um piloto por caso | Validar a integração e as assertions antes das três repetições formais | Kanan | Aplicada |
| 14/10/2026 | Utilizar `disableVarExpansion: true` nos testes multi-turno | Impedir que o Promptfoo interprete cada turno como um teste independente | Kanan | Aplicada |
| 14/10/2026 | Reutilizar o identificador de sessão nos turnos de uma mesma conversa | Preservar o contexto conversacional e iniciar novas sessões em avaliações independentes | Kanan | Aplicada |
| 14/10/2026 | Ajustar a assertion dos casos K-03 e K-04 | Evitar exigir uma ferramenta operacional cuja obrigatoriedade ainda não foi confirmada | Kanan | Ajuste provisório |
| 14/10/2026 | Centralizar os defeitos em `docs/defeitos.md` | Manter rastreabilidade sem duplicar registros entre integrantes | Squad | Estrutura adotada |

## 2. Decisões pendentes

| Decisão | Responsável | Situação |
|---|---|---|
| Validar definitivamente os critérios e assertions de ferramentas | Kanan e squad | Pendente |
| Consolidar e revisar os 40 casos do Golden Dataset | Kaua | Pendente |
| Executar três repetições por caso nas versões original e corrigida | Kanan | Pendente |
| Definir thresholds finais de Go/No-Go | Kaua e squad | Pendente |
| Validar e estabilizar o prompt corrigido | Livia | Pendente |
| Consolidar severidades e causas dos defeitos | Nicholas | Pendente |

## 3. Observações

- Os testes piloto não substituem as três repetições exigidas pelo edital.
- As decisões técnicas individuais deverão ser revisadas pela squad quando afetarem critérios compartilhados.
- A verificação atual de ferramentas em K-03 e K-04 é provisória e precisa ser aprimorada antes da avaliação formal.
- Novas decisões relevantes deverão ser registradas conforme o desenvolvimento avançar.