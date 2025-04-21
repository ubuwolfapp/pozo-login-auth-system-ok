
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData } from "@/hooks/useReportData";

/**
 * Genera un PDF del reporte del pozo con fechas, valores y resumen.
 * Descarga el archivo automáticamente.
 */
export const generateReportPdf = ({
  reportData,
  parameterLabel = "Parámetro",
  startDate,
  endDate,
}: {
  reportData: ReportData;
  parameterLabel?: string;
  startDate: Date;
  endDate: Date;
}) => {
  const doc = new jsPDF();

  // Formato de fechas
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  // Encabezado
  doc.setFontSize(18);
  doc.text("Reporte de Pozo", 14, 18);
  doc.setFontSize(12);
  doc.text(`Pozo: ${reportData.pozo_nombre || "N/A"}`, 14, 28);
  doc.text(`Fechas: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 35);
  doc.text(`Parámetro: ${parameterLabel}`, 14, 42);

  // Tabla de datos (fecha - valor)
  autoTable(doc, {
    startY: 50,
    head: [["Fecha", "Valor"]],
    body: reportData.fechas.map((f, i) => [
      formatDate(f),
      reportData.valores[i]?.toLocaleString() ?? "",
    ]),
    theme: "grid",
    headStyles: { fillColor: [0, 161, 214] }, // Cyan
    bodyStyles: { textColor: 50 },
  });

  // Resumen
  let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70;
  doc.setFontSize(14);
  doc.text("Resumen:", 14, y);

  autoTable(doc, {
    startY: y + 5,
    head: [["Parámetro", "Valor", "Estado"]],
    body: reportData.resumen.map((r) => [r.parametro, r.valor, r.estado]),
    headStyles: { fillColor: [255, 98, 0] }, // Orange
    bodyStyles: { textColor: 50 },
    theme: "grid",
  });

  doc.save(
    `Reporte_${reportData.pozo_nombre || "pozo"}_${formatDate(
      startDate
    )}_${formatDate(endDate)}.pdf`
  );
};
