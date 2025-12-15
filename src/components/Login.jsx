import React, { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

import "../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = e => {
    e.preventDefault();
    if (!login(email, password)) {
      setError("Credenciais inválidas");
    }
  };

  return (
    <Container fluid className="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <Row className="login-form-container p-4 shadow bg-white rounded">
        <Col>
          <h2 className="login-title text-center mb-4">Entrar na sua conta</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Entrar
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;