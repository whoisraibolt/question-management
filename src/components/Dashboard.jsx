import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { supabase } from "../utils/supabaseClient";

import "../css/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    multipleChoice: 0,
    discursive: 0,
    totalExams: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const { data: questions } = await supabase.from("questions").select("id, category");
      const { data: exams } = await supabase.from("exams").select("id");

      const totalQuestions = questions.length;
      const multipleChoice = questions.filter(q => q.category === "Múltipla escolha").length;
      const discursive = questions.filter(q => q.category === "Discursiva").length;
      const totalExams = exams.length;

      setStats({ totalQuestions, multipleChoice, discursive, totalExams });
    }
    fetchStats();
  }, []);

  return (
    <Container className="my-4">
      <h2 className="mb-4">Dashboard</h2>
      <Row className="g-4">
        <Col xs={12} sm={6} md={3} className="d-flex">
          <Card className="dashboard-card card-total-questions w-100">
            <Card.Body>
              <Card.Title>Total de questões</Card.Title>
              <Card.Text className="display-6">{stats.totalQuestions}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3} className="d-flex">
          <Card className="dashboard-card card-multiple-choice w-100">
            <Card.Body>
              <Card.Title>Questões de múltipla escolha</Card.Title>
              <Card.Text className="display-6">{stats.multipleChoice}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3} className="d-flex">
          <Card className="dashboard-card card-discursive w-100">
            <Card.Body>
              <Card.Title>Questões discursivas</Card.Title>
              <Card.Text className="display-6">{stats.discursive}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3} className="d-flex">
          <Card className="dashboard-card card-total-exams w-100">
            <Card.Body>
              <Card.Title>Provas criadas</Card.Title>
              <Card.Text className="display-6">{stats.totalExams}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
