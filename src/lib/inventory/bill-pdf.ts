import { formatMoney } from "@/lib/dashboard/sample-data";
import { formatWeight } from "@/lib/inventory/units";

export type BillLine = {
  name: string;
  weight: string;
  amount: string;
};

export type BillData = {
  siteName: string;
  billNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  lines: BillLine[];
  total: string;
};

function escapePdf(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function ascii(text: string) {
  return text.replace(/[^\x20-\x7E]/g, "?");
}

export function buildBillData(input: {
  siteName: string;
  saleId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  lines: { name: string; grams: number; amount: number }[];
  total: number;
}): BillData {
  return {
    siteName: input.siteName,
    billNo: `BILL-${input.saleId.slice(-6).toUpperCase()}`,
    date: new Date(input.createdAt).toISOString().slice(0, 16).replace("T", " "),
    customerName: input.customerName,
    customerPhone: input.customerPhone || "-",
    lines: input.lines.map((line) => ({
      name: line.name,
      weight: formatWeight(line.grams),
      amount: formatMoney(line.amount),
    })),
    total: formatMoney(input.total),
  };
}

export function createBillPdf(bill: BillData) {
  const commands = [
    "BT",
    "/F1 20 Tf",
    `1 0 0 1 50 790 Tm`,
    `(${escapePdf(ascii(bill.siteName))}) Tj`,
    "/F1 12 Tf",
    `1 0 0 1 50 768 Tm`,
    `(Sale Bill) Tj`,
    `1 0 0 1 50 740 Tm`,
    `(Bill No: ${escapePdf(ascii(bill.billNo))}) Tj`,
    `1 0 0 1 50 722 Tm`,
    `(Date: ${escapePdf(ascii(bill.date))}) Tj`,
    `1 0 0 1 50 704 Tm`,
    `(Customer: ${escapePdf(ascii(bill.customerName))}) Tj`,
    `1 0 0 1 50 686 Tm`,
    `(Phone: ${escapePdf(ascii(bill.customerPhone))}) Tj`,
    `1 0 0 1 50 650 Tm`,
    `(Item) Tj`,
    `1 0 0 1 280 650 Tm`,
    `(Weight) Tj`,
    `1 0 0 1 420 650 Tm`,
    `(Amount) Tj`,
  ];

  let y = 628;

  bill.lines.forEach((line) => {
    commands.push(`1 0 0 1 50 ${y} Tm`, `(${escapePdf(ascii(line.name))}) Tj`);
    commands.push(`1 0 0 1 280 ${y} Tm`, `(${escapePdf(ascii(line.weight))}) Tj`);
    commands.push(`1 0 0 1 420 ${y} Tm`, `(${escapePdf(ascii(line.amount))}) Tj`);
    y -= 20;
  });

  commands.push(
    `1 0 0 1 50 ${y - 16} Tm`,
    `(Total: ${escapePdf(ascii(bill.total))}) Tj`,
    `1 0 0 1 50 ${y - 48} Tm`,
    `(Thank you) Tj`,
    "ET",
  );

  const stream = commands.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const startxref = pdf.length;
  const xrefRows = offsets
    .slice(1)
    .map((value) => `${String(value).padStart(10, "0")} 00000 n `)
    .join("\n");

  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefRows}\n`;
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBillPdf(bill: BillData) {
  const url = URL.createObjectURL(createBillPdf(bill));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${bill.billNo}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
