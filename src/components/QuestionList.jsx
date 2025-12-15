import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "react-bootstrap";
import { supabase } from "../utils/supabaseClient";

import { BsArrowClockwise  } from "react-icons/bs";

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

const QuestionList = ({ onEdit }) => {
  const [questions, setQuestions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("questions").select("*");
      if (error) {
        console.error("Erro ao buscar questões:", error.message);
        return;
      }
      setQuestions(data || []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const sortedQuestions = useMemo(() => {
    if (!questions.length) return [];
    const sorted = [...questions];
    if (sortConfig?.key) {
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
  }, [questions, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="question-list-container">
      <h3 className="mb-4" style={{ color: "#242424", fontWeight: "bold" }}>
        Lista de Questões
      </h3>
      
      {loading && <div className="text-center py-3">Carregando...</div>}
      
      <table className="custom-table">
        <thead>
          <tr>
            <th onClick={() => requestSort("code")}>Código{getSortIndicator("code")}</th>
            <th onClick={() => requestSort("category")}>Tipo / Enunciado{getSortIndicator("category")}</th>
            <th onClick={() => requestSort("created_at")}>Data de Criação{getSortIndicator("created_at")}</th>
            <th>Opções</th>
          </tr>
        </thead>
        <tbody>
          {sortedQuestions.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                {loading ? "Carregando..." : "Nenhuma questão encontrada."}
              </td>
            </tr>
          ) : (
            sortedQuestions.map((q) => (
              <tr key={q.code}>
                <td style={{ wordBreak: "break-word", fontWeight: "bold" }}>{q.code}</td>
                <td>
                  <strong>{q.category}</strong> - {q.enunciado?.slice(0, 100)}...
                </td>
                <td>{formatDate(q.created_at)}</td>
                <td style={{ textAlign: "center" }}>
                  <Button
                    className="custom-btn-primary me-1"
                    size="sm"
                    onClick={() => onEdit?.(q.code)}
                    disabled={loading}
                  >
                    Abrir
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div className="mt-3 d-flex justify-content-end">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={fetchQuestions}
          disabled={loading}
        >
          <BsArrowClockwise className="me-1" />
          Atualizar
        </Button>
      </div>
    </div>
  );
};

export default QuestionList;
