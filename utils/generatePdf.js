import PDFDocument from "pdfkit";
import fs from "fs";

export function generatePdf(firstname, password, outputPath) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));

    doc.image("public/logo.png", 50, 40, { width: 100 });
    doc.moveDown(3);

    doc.fontSize(18).text(`Hej ${firstname},`, { align: "left" });
    doc.moveDown();
    doc.fontSize(14).text(
      `Här är dina inloggningsuppgifter till systemet:`,
      { align: "left" }
    );

    doc.moveDown();
    doc.font("Helvetica-Bold").text(`Lösenord: ${password}`);
    doc.font("Helvetica");
    doc.moveDown(2);

    doc.text("Om du har frågor, kontakta oss på:");
    doc.text("support@dinfirma.se");
    doc.text("Tel: 070-123 45 67");
    doc.text("www.dinfirma.se");

    doc.end();
    doc.on("finish", resolve);
  });
}
