# Verificação neste repositório

Os testes técnicos do pacote TT Skills 0.1.0 rodam aqui como estão, mais uma
verificação de que as cinco skills do repositório têm `SKILL.md`.

```bash
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
```

`tests/test_scripts.py` verifica `skills/tt-instagram/scripts/carousel.py` e
`skills/tt-visual/scripts/contrast.py` com arquivos sintéticos. Nenhum teste
acessa a conta do Instagram, a rede ou credenciais.

`tests/test_bundle.py` foi adaptado: no pacote original ele exigia que
`skills/` contivesse exatamente as três skills `tt-*`; aqui as verificações de
frontmatter e de links ficam restritas a essas três, e uma verificação nova
confirma que as cinco skills do repositório existem. Nenhuma verificação de
conteúdo foi relaxada. A adaptação está registrada em `PROCEDENCIA.md`.

Os cenários de comportamento em `evals/` **não** foram executados por estes
testes e continuam marcados como `not_executed_in_agent_runtime`. Eles precisam
ser rodados no ambiente onde as skills serão usadas.
