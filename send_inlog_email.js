import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import { generatePdf } from "./utils/generatePdf.js";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/views", express.static("views"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "views" });
});

app.post("/send", async (req, res) => {
  const { firstname, email, includePdf } = req.body;
  const password = req.body.password && req.body.password.trim() !== "" 
  ? req.body.password.trim() 
  : Math.random().toString(36).slice(-8);
  //const password = Math.random().toString(36).slice(-8);

  const template = fs.readFileSync("./views/email_template.html", "utf8");
  const html = template
    .replaceAll("{{firstname}}", firstname)
    .replaceAll("{{password}}", password);

  let attachments = [];
  if (includePdf) {
    const pdfPath = `./temp/${firstname}_info.pdf`;
    await generatePdf(firstname, password, pdfPath);
    attachments.push({ filename: `${firstname}_info.pdf`, path: pdfPath });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "Ditt nya lösenord",
    html,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send(`<h2>Mejlet till ${firstname} (${email}) har skickats!</h2>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fel vid utskick: " + err.message);
  }
});

app.listen(3000, () =>
  console.log("Server igång på http://localhost:3012")
);
