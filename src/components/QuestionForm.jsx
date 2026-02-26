import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { supabase } from "../utils/supabaseClient";

const QuestionForm = ({ questionId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    enunciado: "",
    categoria: "Múltipla escolha",
    alternativa1: "",
    alternativa2: "",
    alternativa3: "",
    alternativa4: "",
    alternativa5: "",
    alternativaCorreta: "Alternativa 1",
    respostaComentada: "",
    modeloItem: "001",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (questionId) {
      loadQuestion();
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [questionId]);

  const resetForm = () => {
    setFormData({
      enunciado: "",
      categoria: "Múltipla escolha",
      alternativa1: "",
      alternativa2: "",
      alternativa3: "",
      alternativa4: "",
      alternativa5: "",
      alternativaCorreta: "Alternativa 1",
      respostaComentada: "",
      modeloItem: "001",
    });
    setError("");
    setSuccessMessage("");
  };

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (error) throw error;
      if (!data) {
        setError("Questão não encontrada.");
        setLoading(false);
        return;
      }

      const correctAlt = data.correct_alternative !== null
        ? `Alternativa ${data.correct_alternative + 1}`
        : "Alternativa 1";

      const modeloCodigo = data.item_model?.split(" - ")[0] || "001";

      setFormData({
        enunciado: data.statement || "",
        categoria: data.category || "Múltipla escolha",
        alternativa1: data.alternatives?.[0] || "",
        alternativa2: data.alternatives?.[1] || "",
        alternativa3: data.alternatives?.[2] || "",
        alternativa4: data.alternatives?.[3] || "",
        alternativa5: data.alternatives?.[4] || "",
        alternativaCorreta: correctAlt,
        respostaComentada: data.answer_comment || "",
        modeloItem: modeloCodigo,
      });
      setIsEditing(true);
      setError("");
      setSuccessMessage("");
    } catch (err) {
      setError("Erro ao carregar: " + err.message);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMessage("");
  };

  const handleCategoriaChange = (e) => {
    const newCategoria = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoria: newCategoria,
      ...(newCategoria === "Discursiva"
        ? {
            alternativa1: "",
            alternativa2: "",
            alternativa3: "",
            alternativa4: "",
            alternativa5: "",
            alternativaCorreta: "",
            modeloItem: "005",
          }
        : {
            alternativaCorreta: "Alternativa 1",
            modeloItem: prev.modeloItem === "005" ? "001" : prev.modeloItem,
          }),
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const alternatives =
        formData.categoria !== "Discursiva"
          ? [
              formData.alternativa1,
              formData.alternativa2,
              formData.alternativa3,
              formData.alternativa4,
              formData.alternativa5,
            ]
          : null;

      let correctAlternative = null;
      if (formData.categoria !== "Discursiva") {
        correctAlternative =
          parseInt(formData.alternativaCorreta.split(" ")[1], 10) - 1;
      }

      const modeloItemMap = {
        "001": "001 - RESPOSTA UNICA",
        "002": "002 - AFIRMAÇÃO INCOMPLETA",
        "003": "003 - RESPOSTA MÚLTIPLA",
        "004": "004 - ASSERÇÃO E RAZÃO",
        "005": "005 - DISCURSIVA",
      };

      if (!modeloItemMap[formData.modeloItem]) {
        throw new Error(
          "Modelo inválido. Use apenas: 001, 002, 003, 004 ou 005"
        );
      }

      const modeloItemFull = modeloItemMap[formData.modeloItem];

      const questionData = {
        statement: formData.enunciado.trim(),
        category: formData.categoria,
        alternatives: alternatives,
        correct_alternative: correctAlternative,
        answer_comment: formData.respostaComentada?.trim() || null,
        item_model: modeloItemFull,
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from("questions")
          .update(questionData)
          .eq("id", questionId);
      } else {
        result = await supabase.from("questions").insert([questionData]);
      }

      if (result.error) throw result.error;

      setSuccessMessage(isEditing ? "Questão atualizada com sucesso!" : "Questão salva com sucesso!");
      if (onSave) onSave();
      if (!isEditing) resetForm(); // Limpa formulário após salvar nova questão
    } catch (err) {
      console.error("Erro completo:", err);
      setError("Erro: " + err.message);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta questão?")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("questions").delete().eq("id", questionId);
      if (error) throw error;

      setSuccessMessage("Questão excluída com sucesso!");
      setError("");
      if (onSave) onSave();
    } catch (err) {
      setError("Erro ao excluir: " + err.message);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const modeloOptions = [
    { value: "001", label: "RESPOSTA UNICA" },
    { value: "002", label: "AFIRMAÇÃO INCOMPLETA" },
    { value: "003", label: "RESPOSTA MÚLTIPLA" },
    { value: "004", label: "ASSERÇÃO E RAZÃO" },
    { value: "005", label: "DISCURSIVA" },
  ];

  if (loading) {
    return (
      <Container className="my-4" style={{ maxWidth: 800 }}>
        <Card className="shadow-sm rounded-3 p-4">
          <div className="text-center">Carregando questão...</div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-4" style={{ maxWidth: 800 }}>
      <Card className="shadow-sm rounded-3 p-4">
        <Card.Title className="mb-4">
          {isEditing ? "Editar Questão" : "Cadastrar Questão"}
        </Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="enunciado">
            <Form.Label>Enunciado *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="enunciado"
              value={formData.enunciado}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Digite o enunciado da questão"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="categoria">
            <Form.Label>Categoria *</Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria}
              onChange={handleCategoriaChange}
              required
              disabled={loading}
            >
              <option>Múltipla escolha</option>
              <option>Discursiva</option>
            </Form.Select>
          </Form.Group>

          {formData.categoria !== "Discursiva" && (
            <>
              {[
                "alternativa1",
                "alternativa2",
                "alternativa3",
                "alternativa4",
                "alternativa5",
              ].map((alt, idx) => (
                <Form.Group className="mb-3" controlId={alt} key={alt}>
                  <Form.Label>{`Alternativa ${idx + 1} *`}</Form.Label>
                  <Form.Control
                    type="text"
                    name={alt}
                    value={formData[alt]}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder={`Digite a alternativa ${idx + 1}`}
                  />
                </Form.Group>
              ))}
              <Form.Group className="mb-3" controlId="alternativaCorreta">
                <Form.Label>Alternativa correta *</Form.Label>
                <Form.Select
                  name="alternativaCorreta"
                  value={formData.alternativaCorreta}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option>Alternativa 1</option>
                  <option>Alternativa 2</option>
                  <option>Alternativa 3</option>
                  <option>Alternativa 4</option>
                  <option>Alternativa 5</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3" controlId="respostaComentada">
            <Form.Label>Resposta Comentada *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="respostaComentada"
              value={formData.respostaComentada}
              onChange={handleChange}
              disabled={loading}
              placeholder="Digite a resposta comentada"
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="modeloItem">
            <Form.Label>Tipo de Modelo *</Form.Label>
            <Form.Select
              name="modeloItem"
              value={formData.modeloItem}
              onChange={handleChange}
              required
              disabled={formData.categoria === "Discursiva" || loading}
            >
              {modeloOptions
                .filter((opt) =>
                  formData.categoria === "Múltipla escolha"
                    ? ["001", "002", "003", "004"].includes(opt.value)
                    : formData.categoria === "Discursiva"
                    ? opt.value === "005"
                    : true
                )
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {`${opt.value} - ${opt.label}`}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                if (isEditing) {
                  if (onClose) onClose();
                  else if (onSave) onSave();
                } else {
                  resetForm();
                }
              }}
              disabled={loading}
            >
              {isEditing ? "Cancelar" : "Limpar"}
            </Button>

            {isEditing && (
              <Button
                variant="danger"
                type="button"
                onClick={handleDelete}
                disabled={loading}
              >
                Excluir
              </Button>
            )}

            <Button variant="primary" type="submit" disabled={loading}>
              {isEditing ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default QuestionForm;
