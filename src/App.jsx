import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import QuestionForm from "./components/QuestionForm";
import QuestionList from "./components/QuestionList";
import ExamForm from "./components/ExamForm";
import ExamList from "./components/ExamList";
import Import from "./components/Import";

import { BsMarkerTip, BsPencilSquare, BsFilePlus, BsGridFill, BsCardChecklist, BsFileEarmarkText, BsBoxArrowRight } from "react-icons/bs";

import "./css/Sidebar.css";
import "./css/AppContent.css";

const Sidebar = ({ view, setView, logout }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <BsMarkerTip size={48} />
        <h2>Gerenciador de Questões</h2>
      </div>

      <button
        className={`sidebar-button ${view === "dashboard" ? "active" : ""}`}
        onClick={() => setView("dashboard")}
      >
        <BsGridFill style={{ marginRight: 8, verticalAlign: "middle" }} />
        Dashboard
      </button>

      <hr className="sidebar-divider" />

      <div className="sidebar-section-title">Questões</div>

      <button
        className={`sidebar-button ${view === "cadastrar-questao" ? "active" : ""}`}
        onClick={() => setView("cadastrar-questao")}
      >
        <BsPencilSquare style={{ marginRight: 8, verticalAlign: "middle" }} />
        Cadastrar Questão
      </button>

      <button
        className={`sidebar-button ${view === "questions" ? "active" : ""}`}
        onClick={() => setView("questions")}
      >
        <BsCardChecklist style={{ marginRight: 8, verticalAlign: "middle" }} />
        Questões
      </button>

      <button
        className={`sidebar-button ${view === "import" ? "active" : ""}`}
        onClick={() => setView("import")}
      >
        <BsFilePlus style={{ marginRight: 8, verticalAlign: "middle" }} />
        Importar
      </button>

      <hr className="sidebar-divider" />

      <div className="sidebar-section-title">Provas</div>

      <button
        className={`sidebar-button ${view === "cadastrar-prova" ? "active" : ""}`}
        onClick={() => setView("cadastrar-prova")}
      >
        <BsFilePlus style={{ marginRight: 8, verticalAlign: "middle" }} />
        Cadastrar Prova
      </button>

      <button
        className={`sidebar-button ${view === "exams" ? "active" : ""}`}
        onClick={() => setView("exams")}
      >
        <BsFileEarmarkText style={{ marginRight: 8, verticalAlign: "middle" }} />
        Provas
      </button>

      <div className="sidebar-spacer"></div>

      <button className="sidebar-button logout" onClick={logout}>
        <BsBoxArrowRight style={{ marginRight: 8, verticalAlign: "middle" }} />
        Sair
      </button>
    </nav>
  );
};

const AppContent = () => {
  const { user, logout } = useAuth();
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [view, setView] = useState("dashboard");

  const handleSetView = (newView) => {
    if (newView === "cadastrar-questao") {
      setEditingQuestionId(null);
    }
    setView(newView);
  };

  if (!user) return <Login />;

  return (
    <div className="app-container">
      <Sidebar view={view} setView={handleSetView} logout={logout} />
      <main className="app-main">
        {view === "dashboard" && <Dashboard />}

        {view === "cadastrar-questao" && (
          <QuestionForm onSave={() => setView("questions")} />
        )}

        {view === "questions" && (
          <>
            <QuestionList 
              onEdit={setEditingQuestionId}
              onRefresh={() => {}} 
            />
            {editingQuestionId && (
              <QuestionForm
                questionId={editingQuestionId}
                onSave={() => {
                  setEditingQuestionId(null);
                }}
              />
            )}
          </>
        )}

        {view === "import" && <Import />} {/* Aqui renderiza o componente Import */}

        {view === "cadastrar-prova" && (
          <ExamForm onSave={() => setView("exams")} />
        )}

        {view === "exams" && <ExamList />}
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;