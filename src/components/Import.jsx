import React, { useState, useRef } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { importarQuestoesSupabase } from "../utils/importFunctions";

import "../css/Import.css";

const Import = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    setSuccessMessage("");
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/json") {
        setError("Por favor, selecione um arquivo JSON válido.");
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!file) {
      setError("Selecione um arquivo JSON para importar.");
      return;
    }

    setUploading(true);

    try {
      const fileText = await file.text();
      const jsonData = JSON.parse(fileText);

      if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        setError("Arquivo JSON inválido, vazio ou não está no formato esperado (array de questões).");
        setUploading(false);
        return;
      }

      for (const questao of jsonData) {
        if (questao.alternatives !== null && !Array.isArray(questao.alternatives)) {
          setError("Campo 'alternatives' deve ser um array ou null.");
          setUploading(false);
          return;
        }
      }

      const result = await importarQuestoesSupabase(jsonData);

      if (result.success) {
        setSuccessMessage(`Importação concluída com sucesso! ${result.inserted} questões inseridas.`);
      } else {
        setError("Falha na importação: " + result.message);
      }
    } catch (err) {
      setError("Erro ao processar o arquivo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setError("");
    setSuccessMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <Container className="my-4" style={{ maxWidth: 600 }}>
      <Card className="shadow-sm rounded-3 p-4">
        <Card.Title className="mb-4">Arquivo de importação de questões</Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="file-input" className="mb-3">
            <Form.Label>Permite enviar arquivos de questões no formato (JSON)*</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              required={!file}
              disabled={uploading}
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              <a href="/ARQUIVO-IMPORTACAO.md" download>
                <Button type="button" className="btn-green">
                  Baixar instruções (README.md)
                </Button>
              </a>
            </div>

            <div className="d-flex gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={uploading}>
                {uploading ? "Enviando..." : "Upload"}
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default Import;
