import React, { useState } from "react";
import ExcelForm from "./ExcelForm";
import * as XLSX from "xlsx";
import "./App.css";

const App = () => {
  const [form1Data, setForm1Data] = useState([]);
  const [form2Data, setForm2Data] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [fileName, setFileName] = useState("Merged");

  const mergeArrays = (leftItems, soldItems) => {
    const map = new Map();
    // Add counts from leftItems to the map
    leftItems.forEach(([name, count]) => {
      map.set(name, count);
    });

    // Add counts from soldItems to the map or update existing counts
    soldItems.forEach(([name, count]) => {
      if (map.has(name)) {
        map.set(name, map.get(name) + count);
      } else {
        map.set(name, count);
      }
    });

    // Calculate the quantity to order (soldItems count + 10%)
    const toOrder = [];
    map.forEach((count, name) => {
      const quantitySold = soldItems.find((item) => item[0] === name)[1];
      const quantityLeft = leftItems.find((item) => item[0] === name)[1];
      const orderQuantity = quantitySold + Math.ceil(quantitySold * 0.2);
      if (orderQuantity > quantityLeft) {
        toOrder.push([name, Math.ceil(orderQuantity) - quantityLeft]);
      }
    });

    return toOrder;
  };

  const mergeData = () => {
    if (form1Data.length > 0 && form2Data.length > 0) {
      const merged = mergeArrays(form1Data, form2Data);
      setMergedData(merged);
    }
  };
const exportToExcel = () => {
  const wb = XLSX.utils.book_new();
  
  // Modify the mergedData array to include the column names
  const modifiedData = [
    ["დასახელება", "რაოდენობა"],
    ...mergedData,
  ];

  const ws = XLSX.utils.json_to_sheet(modifiedData);

  // Calculate column widths
  const colWidths = modifiedData.reduce((acc, row) => {
    Object.keys(row).forEach((key) => {
      acc[key] = Math.max(acc[key] || 0, String(row[key]).length);
    });
    return acc;
  }, {});

  // Set column widths in the sheet
  ws["!cols"] = Object.keys(colWidths).map((key) => ({
    wch: colWidths[key],
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Merged Data");
  XLSX.writeFile(wb, `${fileName}`);
};

  return (
    <div className="form-wrapper">
      <h1>შეკვეთს გაკეთბა</h1>

      <div className="form-container">
        <h2 className="form-header">ნაშთი</h2>
        <ExcelForm
          onFileLoad={setForm1Data}
          inputText={"აირჩიე ნაშთის ფაილი"}
          setFileName={setFileName}
        />
      </div>

      <div className="form-container">
        <h2 className="form-header">გაყიდული ჯამურად</h2>
        <ExcelForm
          onFileLoad={setForm2Data}
          inputText={"აირჩიე გაყიდულის ფაილი"}
          setFileName={setFileName}
        />
      </div>

      <button
        onClick={mergeData}
        className={`calculate ${form1Data.length === 0 || form2Data.length === 0 ? 'disabled-button' : ''}`}
        disabled={form1Data.length === 0 || form2Data.length === 0}
      >
        გამოთვლა
      </button>

      <button 
        onClick={exportToExcel}
        className={`export-button ${mergedData.length === 0 ? 'disabled-button' : ''}`}
        disabled={mergedData.length === 0}
      >
        შენახვა Excel-ში
      </button>

      <h2>შედეგი</h2>
      <table>
        <thead>
          <tr>
            <th>დასახელება</th>
            <th>რაოდენობა</th>
          </tr>
        </thead>
        <tbody className="table">
          {mergedData.map(([name, count], index) => (
            <tr key={index}>
              <td>{name}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
