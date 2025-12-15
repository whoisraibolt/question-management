# 📄 Arquivo de Importação de Questões

Este documento descreve o formato esperado para o arquivo JSON utilizado na importação de múltiplas questões no sistema.

## 🧩 Estrutura Geral

O arquivo deve conter um **array JSON** onde cada elemento representa uma questão.

Exemplo básico:

```json
[
  {
    "statement": "Qual é a capital do Brasil?",
    "category": "Geografia",
    "alternatives": ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"],
    "correct_alternative": 1,
    "answer_comment": "Brasília é a capital federal do Brasil desde 1960.",
    "item_model": "001 - OBJETIVA"
  },
  {
    "statement": "Explique a teoria da relatividade.",
    "category": "Física",
    "alternatives": null,
    "correct_alternative": null,
    "answer_comment": null,
    "item_model": "005 - DISCURSIVA"
  }
]
```

## 📝 Campos das Questões

| Campo              | Tipo               | Obrigatório | Descrição                                                                                       |
|--------------------|--------------------|-------------|------------------------------------------------------------------------------------------------|
| `statement`        | string             | Sim         | Enunciado da questão.                                                                           |
| `category`         | string             | Sim         | Categoria da questão. Deve ser exatamente **"Múltipla escolha"** ou **"Discursiva"**. |
| `alternatives`     | array de strings | Não | Lista de alternativas para questões objetivas. Use `null` para questões discursivas.            |
| `correct_alternative` | número | Não       | Índice (base zero) da alternativa correta no array `alternatives`. Use `null` para questões discursivas. |
| `answer_comment`   | string | Sim       |  Comentário ou explicação da resposta.                                                          |
| `item_model`      | string             | Sim         | Modelo ou tipo da questão. Deve ser exatamente um dos seguintes valores: **"001 - RESPOSTA UNICA"**, **"002 - AFIRMAÇÃO INCOMPLETA"**, **"003 - RESPOSTA MÚLTIPLA"**, **"004 - ASSERÇÃO E RAZÃO"**, **"005 - DISCURSIVA"**. Se não informado, assume **"005 - DISCURSIVA"**. |

## ⚠️ Regras Importantes

- O arquivo JSON deve ser válido (bem formatado).
- O conteúdo principal deve ser um array contendo uma ou mais questões.

## 🚀 Como Importar

- Selecione um arquivo `.json` contendo o array de questões conforme especificado.
- Faça o upload no sistema de importação.
- O sistema validará e importará as questões no banco de dados.

---
❓ Se houver dúvidas ou problemas, entre em contato com o suporte técnico.