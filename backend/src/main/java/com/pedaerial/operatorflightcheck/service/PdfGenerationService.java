package com.pedaerial.operatorflightcheck.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.pedaerial.operatorflightcheck.entity.Agreement;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.exception.PdfGenerationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    @Value("${app.pdf.output-dir}")
    private String outputDir;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    public Path generateInvoicePdf(Invoice invoice) {
        try {
            Path dir = Paths.get(outputDir, "invoices");
            Files.createDirectories(dir);
            Path file = dir.resolve(invoice.getInvoiceNumber() + ".pdf");

            Document doc = new Document();
            PdfWriter.getInstance(doc, new FileOutputStream(file.toFile()));
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            doc.add(new Paragraph("PED AERIAL", titleFont));
            doc.add(new Paragraph("INVOICE", headerFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), normalFont));
            doc.add(new Paragraph("Date: " + (invoice.getCreatedAt() != null ? invoice.getCreatedAt().toString().substring(0, 10) : ""), normalFont));
            doc.add(new Paragraph("Due Date: " + (invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FMT) : ""), normalFont));
            doc.add(Chunk.NEWLINE);

            if (invoice.getClient() != null) {
                doc.add(new Paragraph("Bill To:", headerFont));
                doc.add(new Paragraph(invoice.getClient().getName(), normalFont));
                if (invoice.getClient().getCompany() != null) {
                    doc.add(new Paragraph(invoice.getClient().getCompany(), normalFont));
                }
            }
            doc.add(Chunk.NEWLINE);

            if (invoice.getLineItems() != null && !invoice.getLineItems().isEmpty()) {
                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{4, 1, 2, 2});
                addTableHeader(table, headerFont, "Description", "Qty", "Unit Price", "Amount");
                for (var li : invoice.getLineItems()) {
                    addTableRow(table, normalFont,
                        li.getDescription(),
                        li.getQuantity() != null ? li.getQuantity().toPlainString() : "1",
                        li.getUnitPrice() != null ? "$" + li.getUnitPrice().toPlainString() : "",
                        li.getAmount() != null ? "$" + li.getAmount().toPlainString() : "");
                }
                doc.add(table);
                doc.add(Chunk.NEWLINE);
            }

            doc.add(new Paragraph("Subtotal: $" + (invoice.getAmount() != null ? invoice.getAmount().toPlainString() : "0.00"), normalFont));
            doc.add(new Paragraph("Tax: $" + (invoice.getTaxAmount() != null ? invoice.getTaxAmount().toPlainString() : "0.00"), normalFont));
            doc.add(new Paragraph("Total: $" + (invoice.getTotalAmount() != null ? invoice.getTotalAmount().toPlainString() : "0.00"), headerFont));
            doc.add(Chunk.NEWLINE);

            if (invoice.getJob() != null && invoice.getJob().getPilot() != null) {
                String terms = "Questions? Contact " + invoice.getJob().getPilot().getFirstName()
                    + " " + invoice.getJob().getPilot().getLastName()
                    + " at " + invoice.getJob().getPilot().getEmail();
                doc.add(new Paragraph(terms, normalFont));
            }

            doc.close();
            return file;
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException("Failed to generate invoice PDF", e);
        }
    }

    public Path generateAgreementPdf(Agreement agreement) {
        try {
            Path dir = Paths.get(outputDir, "agreements");
            Files.createDirectories(dir);
            Path file = dir.resolve(agreement.getAgreementNumber() + ".pdf");

            Document doc = new Document();
            PdfWriter.getInstance(doc, new FileOutputStream(file.toFile()));
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            doc.add(new Paragraph("SERVICE AGREEMENT", titleFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Agreement #: " + agreement.getAgreementNumber(), normalFont));
            doc.add(new Paragraph("Date: " + (agreement.getCreatedAt() != null ? agreement.getCreatedAt().toString().substring(0, 10) : ""), normalFont));
            doc.add(Chunk.NEWLINE);

            if (agreement.getJob() != null) {
                var job = agreement.getJob();
                if (job.getPilot() != null) {
                    doc.add(new Paragraph("Service Provider:", headerFont));
                    doc.add(new Paragraph(job.getPilot().getFirstName() + " " + job.getPilot().getLastName(), normalFont));
                    doc.add(new Paragraph("PED AERIAL", normalFont));
                }
                doc.add(Chunk.NEWLINE);
                if (job.getClient() != null) {
                    doc.add(new Paragraph("Customer:", headerFont));
                    doc.add(new Paragraph(job.getClient().getName(), normalFont));
                    if (job.getClient().getCompany() != null) {
                        doc.add(new Paragraph(job.getClient().getCompany(), normalFont));
                    }
                }
                doc.add(Chunk.NEWLINE);
                doc.add(new Paragraph("Scope of Work:", headerFont));
                doc.add(new Paragraph("Job: " + job.getTitle(), normalFont));
                if (job.getDescription() != null) {
                    doc.add(new Paragraph(job.getDescription(), normalFont));
                }
                doc.add(new Paragraph("Site: " + job.getSiteAddress(), normalFont));
                if (job.getScheduledDate() != null) {
                    doc.add(new Paragraph("Scheduled: " + job.getScheduledDate().format(DATE_FMT), normalFont));
                }
            }
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Terms and Conditions", headerFont));
            doc.add(new Paragraph(
                "1. Scope of Work. Provider agrees to perform the aerial inspection services described above at the specified site on the scheduled date, subject to weather and airspace conditions.",
                normalFont));
            doc.add(new Paragraph(
                "2. Payment Terms. Customer agrees to pay the total amount listed above according to the agreed payment schedule. Late payments are subject to a 1.5% monthly finance charge.",
                normalFont));
            doc.add(new Paragraph(
                "3. Cancellation Policy. Cancellations made less than 48 hours before the scheduled date are subject to a 25% cancellation fee. Cancellations due to weather or airspace restrictions are rescheduled at no charge.",
                normalFont));
            doc.add(new Paragraph(
                "4. Limitation of Liability. Provider's liability is limited to the amount paid for services. Provider is not liable for indirect, consequential, or incidental damages arising from the use of deliverables.",
                normalFont));
            doc.add(new Paragraph(
                "5. Deliverables. Provider will deliver all inspection media (photos, video, reports) within 5 business days of completed flight unless otherwise agreed in writing.",
                normalFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Customer Signature: _________________________   Date: ___________", normalFont));
            doc.add(new Paragraph("Printed Name: _______________________________", normalFont));

            doc.close();
            return file;
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException("Failed to generate agreement PDF", e);
        }
    }

    private void addTableHeader(PdfPTable table, Font font, String... headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, font));
            cell.setBackgroundColor(new java.awt.Color(200, 200, 200));
            table.addCell(cell);
        }
    }

    private void addTableRow(PdfPTable table, Font font, String... values) {
        for (String v : values) {
            table.addCell(new PdfPCell(new Phrase(v != null ? v : "", font)));
        }
    }
}
