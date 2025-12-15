import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../utils/supabaseClient";

const ExamForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    discipline: "",
    numMultiple: 0,
    numDiscursive: 0,
    calculationMethod: "Média Ponderada",
    maxScore: 10,
    selectedQuestions: [],
    selectionMode: "manual",
  });

  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableCounts, setAvailableCounts] = useState({ multiple: 0, discursive: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    supabase
      .from("questions")
      .select("id, category, statement")
      .then(({ data, error }) => {
        if (!error && data) {
          setAllQuestions(data);
          setAvailableCounts({
            multiple: data.filter((q) => q.category === "Múltipla escolha").length,
            discursive: data.filter((q) => q.category === "Discursiva").length,
          });
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const toggleQuestionSelection = (id) => {
    setFormData((prev) => {
      const selected = prev.selectedQuestions.includes(id)
        ? prev.selectedQuestions.filter((qid) => qid !== id)
        : [...prev.selectedQuestions, id];
      return { ...prev, selectedQuestions: selected };
    });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const shuffleArray = (arr) => {
    let array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const selectRandomQuestions = () => {
    const multiple = allQuestions.filter((q) => q.category === "Múltipla escolha");
    const discursive = allQuestions.filter((q) => q.category === "Discursiva");

    const randomMultiple = shuffleArray(multiple).slice(0, formData.numMultiple);
    const randomDiscursive = shuffleArray(discursive).slice(0, formData.numDiscursive);

    setFormData((prev) => ({
      ...prev,
      selectedQuestions: [...randomMultiple, ...randomDiscursive].map((q) => q.id),
    }));

    setSuccessMessage("Questões selecionadas com sucesso!");
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.selectionMode === "automatic") {
      if (formData.numMultiple > availableCounts.multiple) {
        setErrorMessage(
          `Número de questões de múltipla escolha excede o disponível (${availableCounts.multiple}).`
        );
        setSuccessMessage("");
        return;
      }
      if (formData.numDiscursive > availableCounts.discursive) {
        setErrorMessage(
          `Número de questões discursivas excede o disponível (${availableCounts.discursive}).`
        );
        setSuccessMessage("");
        return;
      }
    } else {
      if (formData.selectedQuestions.length === 0) {
        setErrorMessage("Selecione ao menos uma questão para criar a prova.");
        setSuccessMessage("");
        return;
      }
    }

    if (formData.maxScore < 1 || formData.maxScore > 10) {
      setErrorMessage("A nota máxima deve estar entre 1 e 10.");
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    const examData = {
      title: formData.title,
      course: formData.course || null,
      discipline: formData.discipline || null,
      question_config: {
        multipleChoice: formData.selectionMode === "automatic" ? formData.numMultiple : undefined,
        discursive: formData.selectionMode === "automatic" ? formData.numDiscursive : undefined,
      },
      created_by: "usuario@exemplo.com",
      weight_distribution: null,
      max_score: formData.maxScore,
      calculation_method: formData.calculationMethod,
      questions: formData.selectedQuestions,
      created_at: new Date(),
    };

    const { error } = await supabase.from("exams").insert([examData]);

    setLoading(false);

    if (error) {
      setErrorMessage("Erro ao salvar a prova: " + error.message);
      setSuccessMessage("");
      return;
    }

    setSuccessMessage("Prova salva com sucesso!");
    setErrorMessage("");
    setFormData({
      title: "",
      course: "",
      discipline: "",
      numMultiple: 0,
      numDiscursive: 0,
      calculationMethod: "Média Ponderada",
      maxScore: 10,
      selectedQuestions: [],
      selectionMode: "manual",
    });

    if (onSave) onSave();
  };

  return (
    <Container className="my-4" style={{ maxWidth: 800 }}>
      <Card className="shadow-sm rounded-3 p-4">
        <Card.Title className="mb-4">Cadastrar Prova</Card.Title>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Título *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Digite o título da prova"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="course">
            <Form.Label>Curso (opcional)</Form.Label>
            <Form.Control
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Digite o curso"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="discipline">
            <Form.Label>Disciplina (opcional)</Form.Label>
            <Form.Control
              type="text"
              name="discipline"
              value={formData.discipline}
              onChange={handleChange}
              placeholder="Digite a disciplina"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Como você deseja que as questões sejam selecionadas? *</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Modo Manual"
                name="selectionMode"
                id="selectionModeManual"
                value="manual"
                checked={formData.selectionMode === "manual"}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Modo Automático"
                name="selectionMode"
                id="selectionModeAutomatic"
                value="automatic"
                checked={formData.selectionMode === "automatic"}
                onChange={handleChange}
              />
            </div>
          </Form.Group>

          {formData.selectionMode === "manual" && (
            <>
              <Form.Label>Seleção manual de questões</Form.Label>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  border: "1px solid #ced4da",
                  borderRadius: 4,
                  padding: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {allQuestions.map((q) => (
                  <Form.Check
                    key={q.id}
                    type="checkbox"
                    id={`question-${q.id}`}
                    label={`${q.statement?.slice(0, 50) ?? ""}... (${q.category})`}
                    checked={formData.selectedQuestions.includes(q.id)}
                    onChange={() => toggleQuestionSelection(q.id)}
                  />
                ))}
              </div>
              <div className="mb-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedQuestions: allQuestions.map((q) => q.id),
                    }))
                  }
                  className="me-2"
                >
                  Selecionar tudo
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedQuestions: [],
                    }))
                  }
                >
                  Limpar seleção
                </Button>
              </div>
            </>
          )}

          {formData.selectionMode === "automatic" && (
            <>
              <Form.Group className="mb-3" controlId="numMultiple">
                <Form.Label>
                  Número de questões de múltipla escolha (máximo: {availableCounts.multiple})
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={availableCounts.multiple}
                  name="numMultiple"
                  value={formData.numMultiple}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="numDiscursive">
                <Form.Label>
                  Número de questões discursivas (máximo: {availableCounts.discursive})
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={availableCounts.discursive}
                  name="numDiscursive"
                  value={formData.numDiscursive}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button
                variant="secondary"
                className="mb-3"
                type="button"
                onClick={selectRandomQuestions}
                disabled={
                  formData.numMultiple > availableCounts.multiple ||
                  formData.numDiscursive > availableCounts.discursive
                }
              >
                Selecionar questões aleatoriamente
              </Button>
            </>
          )}

          <Form.Group className="mb-3" controlId="maxScore">
            <Form.Label>Nota máxima (entre 1 e 10)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={10}
              name="maxScore"
              value={formData.maxScore}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="calculationMethod">
            <Form.Label>Metodologia de cálculo</Form.Label>
            <Form.Select
              name="calculationMethod"
              value={formData.calculationMethod}
              onChange={handleChange}
              disabled
            >
              <option value="Média Ponderada">Média Ponderada</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-3">
            <Button
              variant="secondary"
              type="reset"
              onClick={() =>
                setFormData({
                  title: "",
                  course: "",
                  discipline: "",
                  numMultiple: 0,
                  numDiscursive: 0,
                  calculationMethod: "Média Ponderada",
                  maxScore: 10,
                  selectedQuestions: [],
                  selectionMode: "manual",
                })
              }
            >
              Limpar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Salvando...
                </>
              ) : (
                "Salvar Prova"
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default ExamForm;
