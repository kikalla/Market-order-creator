import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelForm = ({ onFileLoad, inputText, setFileName }) => {
  const [file, setFile] = useState(null);
  const [formName, setFormName] = useState(inputText);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFormName(file.name);
      setFileName(file.name)
      readExcel(file);
    }
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const filteredData = jsonData.filter(row => row.some(cell => cell !== undefined && cell !== ''));

      // Extract only columns C (index 2) and E (index 4)
      const extractedData = filteredData.slice(3, -1).map((row) => [row[2], row[4]]);

      onFileLoad(extractedData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <label className="custom-file-input">
      {formName}
      <input
        className="form-input"
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
      />
    </label>
  );
};

export default ExcelForm;
