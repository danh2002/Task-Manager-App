"use client";

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import toast from "react-hot-toast";

interface ExportImportProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ isOpen = true, onClose }) => {
  const { theme } = useGlobalState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [exportType, setExportType] = useState<"all" | "tasks" | "boards">("all");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get(
        `/api/export?format=${exportFormat}&type=${exportType}`,
        {
          responseType: exportFormat === "csv" ? "blob" : "json",
        }
      );

      if (exportFormat === "csv") {
        // Handle CSV download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `tasks-export-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Handle JSON download
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `task-manager-export-${new Date().toISOString().split("T")[0]}.json`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast.success("Export completed successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith(".json")) {
        data = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        // Parse CSV to JSON
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
        
        data = {
          tasks: lines.slice(1).filter((line) => line.trim()).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
            const task: any = {};
            headers.forEach((header, index) => {
              task[header] = values[index];
            });
            return task;
          }),
        };
      } else {
        toast.error("Unsupported file format. Please use JSON or CSV.");
        return;
      }

      const response = await axios.post("/api/export", {
        data,
        mode: importMode,
      });

      if (response.data.success) {
        toast.success(
          `Import completed! ${response.data.data.imported.tasks} tasks, ${response.data.data.imported.boards} boards imported.`
        );
        // Optionally refresh the page or trigger data reload
        window.location.reload();
      } else {
        toast.error(response.data.error || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data. Please check the file format.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Container theme={theme}>
      <Header theme={theme}>
        <Title>Export / Import Data</Title>
        {onClose && (
          <CloseButton onClick={onClose} theme={theme}>×</CloseButton>
        )}
      </Header>

      <Content>
        {/* Export Section */}
        <Section theme={theme}>
          <SectionTitle>Export Data</SectionTitle>
          
          <FormGroup>
            <Label>Export Type</Label>
            <Select 
              value={exportType} 
              onChange={(e) => setExportType(e.target.value as any)}
              theme={theme}
            >
              <option value="all">All Data (Tasks + Boards)</option>
              <option value="tasks">Tasks Only</option>
              <option value="boards">Boards Only</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Format</Label>
            <RadioGroup>
              <RadioLabel>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={() => setExportFormat("json")}
                />
                JSON (Recommended)
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                />
                CSV (Tasks only)
              </RadioLabel>
            </RadioGroup>
          </FormGroup>

          <ExportButton 
            onClick={handleExport} 
            disabled={isExporting}
            theme={theme}
          >
            {isExporting ? "Exporting..." : `Export as ${exportFormat.toUpperCase()}`}
          </ExportButton>
        </Section>

        <Divider theme={theme} />

        {/* Import Section */}
        <Section theme={theme}>
          <SectionTitle>Import Data</SectionTitle>
          
          <FormGroup>
            <Label>Import Mode</Label>
            <Select 
              value={importMode} 
              onChange={(e) => setImportMode(e.target.value as any)}
              theme={theme}
            >
              <option value="merge">Merge (Keep existing, add new)</option>
              <option value="replace">Replace (Overwrite duplicates)</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Select File (JSON or CSV)</Label>
            <FileInput
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleImport}
              theme={theme}
            />
          </FormGroup>

          <ImportButton 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            theme={theme}
          >
            {isImporting ? "Importing..." : "Select File to Import"}
          </ImportButton>
        </Section>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  background: ${(props) => props.theme.colorBg2};
  border: 1px solid ${(props) => props.theme.borderColor2};
  border-radius: 0.5rem;
  overflow: hidden;
  max-width: 500px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: ${(props) => props.theme.colorBg3};
  border-bottom: 1px solid ${(props) => props.theme.borderColor2};
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(props) => props.theme.colorGrey0};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colorGrey1};
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: ${(props) => props.theme.colorGrey0};
  }
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${(props) => props.theme.colorGrey0};
  margin: 0 0 1rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) => props.theme.colorGrey1};
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid ${(props) => props.theme.borderColor2};
  background: ${(props) => props.theme.colorBg3};
  color: ${(props) => props.theme.colorGrey1};
  font-size: 0.85rem;
  outline: none;
  
  &:focus {
    border-color: ${(props) => props.theme.colorBlue};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colorGrey1};
  cursor: pointer;
  
  input[type="radio"] {
    cursor: pointer;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px dashed ${(props) => props.theme.borderColor2};
  background: ${(props) => props.theme.colorBg3};
  color: ${(props) => props.theme.colorGrey1};
  font-size: 0.85rem;
  outline: none;
  
  &::file-selector-button {
    margin-right: 1rem;
    padding: 0.4rem 0.8rem;
    border-radius: 0.25rem;
    border: none;
    background: ${(props) => props.theme.colorBlue};
    color: white;
    cursor: pointer;
  }
`;

const ExportButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: none;
  background: ${(props) => props.theme.colorGreen};
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImportButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${(props) => props.theme.colorBlue};
  background: transparent;
  color: ${(props) => props.theme.colorBlue};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colorBlue};
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${(props) => props.theme.borderColor2};
  margin: 1.5rem 0;
`;

export default ExportImport;
