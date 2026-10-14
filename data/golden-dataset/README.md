<!-- Este arquivo explica como documentar os casos do Golden Dataset por integrante. -->
# Golden Dataset

Cada integrante deve registrar seus casos no respectivo `.yaml`, para reduzir conflitos de edição. Kaua consolida e revisa a cobertura; Kanan integra os casos à suíte.

Arquivos: `kanan.yaml` (6 casos), `kaua.yaml` (14), `nicholas.yaml` (10) e `livia.yaml` (10).

Todo caso deve ter identificação (`metadata.id`), responsável, categoria, fonte oficial, critério esperado, mensagem ou `turnos` e pelo menos uma assertion verificável.

O primeiro par de testes no arquivo `kaua.yaml` é apenas um **exemplo fundamentado na base oficial**: preços da pipoca Caramelo Clássico Grande, R$ 39,90.

## Convenções

- IDs: `K-01...K-06`, `KA-01...KA-14`, `N-01...N-10`, `L-01...L-10`.
- Metamórficos: dois casos relacionados pelo mesmo `metadata.par_metamorfico`, formando um par.
- Multi-turno: `vars.turnos` é uma lista de mensagens do mesmo caso, enviadas em sequência na mesma sessão.
- Ferramentas: usar `vars.ferramenta_esperada` e a assertion `file://./src/assercoes.cjs:verificarFerramenta`, após validação da equipe.
- Não inventar resultados esperados: citar sempre um dos arquivos de `base-de-conhecimento-oficial/`.
- Antes da entrega, revisar rigorosamente os 40 casos, os 5 pares metamórficos e a cobertura obrigatória.
