import React, { useEffect, useState, useMemo } from "react";
import { Button } from "react-bootstrap";
import { supabase } from "../utils/supabaseClient";
import "../css/Tables.css";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

  // Função para buscar exames
  const fetchExams = async () => {
    const { data, error } = await supabase.from("exams").select("*");
    if (error) {
      console.error("Erro ao buscar provas:", error.message);
      return;
    }
    setExams(data);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Função para excluir exame
  const deleteExam = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta prova?")) return;

    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir prova: " + error.message);
      return;
    }
    // Atualiza a lista após exclusão
    fetchExams();
  };

  const sortedExams = useMemo(() => {
    if (!exams) return [];
    const sorted = [...exams];
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        let aKey = a[sortConfig.key];
        let bKey = b[sortConfig.key];

        if (typeof aKey === "string") aKey = aKey.toLowerCase();
        if (typeof bKey === "string") bKey = bKey.toLowerCase();

        if (sortConfig.key === "created_at") {
          aKey = new Date(aKey).getTime();
          bKey = new Date(bKey).getTime();
        }

        if (aKey < bKey) return sortConfig.direction === "asc" ? -1 : 1;
        if (aKey > bKey) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [exams, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  // Função auxiliar para buscar questões completas
  const fetchQuestions = async (questionIds) => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds);
    if (error) {
      console.error("Erro ao buscar questões:", error.message);
      return [];
    }
    return data || [];
  };

  const exportJSON = async (exam, includeAnswerKey = false) => {
    // Buscar as questões completas
    const questions = await fetchQuestions(exam.questions);

    // Preparar o objeto de exportação
    const exportData = {
      ...exam,
      questions: questions.map((q) => ({
        id: q.id,
        statement: q.statement,
        category: q.category,
        alternatives: q.alternatives,
        item_model: q.item_model,
        ...(includeAnswerKey ? { correct_alternative: q.correct_alternative, answer_comment: q.answer_comment } : {}),
      })),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${exam.title || "prova"}${includeAnswerKey ? "_gabarito" : ""}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="question-list-container">
      <h3 className="mb-4" style={{ color: "#242424", fontWeight: "bold" }}>
        Lista de Provas
      </h3>
      <table className="custom-table">
        <thead>
          <tr>
            <th onClick={() => requestSort("id")}>Código{getSortIndicator("id")}</th>
            <th onClick={() => requestSort("title")}>Título{getSortIndicator("title")}</th>
            <th onClick={() => requestSort("created_at")}>Data de Criação{getSortIndicator("created_at")}</th>
            <th>Opções</th>
          </tr>
        </thead>
        <tbody>
          {sortedExams.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                Nenhuma prova encontrada.
              </td>
            </tr>
          ) : (
            sortedExams.map((exam) => (
              <tr key={exam.id}>
                <td style={{ wordBreak: "break-word", fontWeight: "bold" }}>{exam.id}</td>
                <td>{exam.title || "—"}</td>
                <td>{formatDate(exam.created_at)}</td>
                <td style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "8px" }}>
                  <Button
                    className="custom-btn-primary"
                    size="sm"
                    onClick={() => exportJSON(exam, false)}
                  >
                    Exportar Prova
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => exportJSON(exam, true)}
                  >
                    Exportar Gabarito
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteExam(exam.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExamList;
