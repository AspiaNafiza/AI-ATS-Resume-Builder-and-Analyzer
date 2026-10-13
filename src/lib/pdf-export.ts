import { jsPDF } from "jspdf";
import type { BuilderResult } from "@/lib/schemas";
import { blankPersonal, normalizeDoc } from "@/components/app/DocumentEditor";
import { formatPeriod } from "@/components/app/DocumentPreview";

export function exportDocumentToPdf(rawDoc: BuilderResult, filename?: string) {
  const doc = normalizeDoc(rawDoc);
  const pdf = new jsPDF({ unit: "pt", format: "letter" });

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin - 20;

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > bottomThreshold) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const p = doc.personal ?? blankPersonal();
  const s = doc.sections;

  const drawHeader = () => {
    // Header: Full Name
    if (p.fullName) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(20, 24, 33);
      pdf.text(p.fullName.toUpperCase(), pageWidth / 2, y, { align: "center" });
      y += 20;
    }

    // Headline
    if (p.headline) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(60, 66, 82);
      pdf.text(p.headline, pageWidth / 2, y, { align: "center" });
      y += 15;
    }

    // Contact line 1 (email, phone, location, website)
    const contact1 = [p.email, p.phone, p.location, p.website].filter(Boolean).join("  |  ");
    if (contact1) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(90, 96, 110);
      pdf.text(contact1, pageWidth / 2, y, { align: "center" });
      y += 13;
    }

    // Contact line 2 (linkedin, github)
    const contact2 = [
      p.linkedin ? `LinkedIn: ${p.linkedin}` : "",
      p.github ? `GitHub: ${p.github}` : "",
    ]
      .filter(Boolean)
      .join("  |  ");
    if (contact2) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(90, 96, 110);
      pdf.text(contact2, pageWidth / 2, y, { align: "center" });
      y += 13;
    }

    // Divider under header
    if (p.fullName || p.headline || contact1) {
      y += 4;
      pdf.setDrawColor(215, 220, 228);
      pdf.setLineWidth(0.75);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 16;
    }
  };

  const drawSectionHeading = (title: string) => {
    checkPageBreak(28);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(20, 24, 33);
    pdf.text(title.toUpperCase(), margin, y);
    y += 4;
    pdf.setDrawColor(215, 220, 228);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  // COVER LETTER FLOW
  if (doc.document_type === "cover_letter") {
    if (s.cover_letter) {
      // Print full formatted cover letter
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(30, 35, 45);
      const lines = pdf.splitTextToSize(s.cover_letter, contentWidth);
      lines.forEach((line: string) => {
        checkPageBreak(14);
        pdf.text(line, margin, y);
        y += 14;
      });
      y += 10;
    } else {
      drawHeader();
      // Date
      const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(40, 44, 52);
      pdf.text(today, margin, y);
      y += 18;

      // Body summary
      if (s.summary) {
        checkPageBreak(30);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(30, 35, 45);
        const lines = pdf.splitTextToSize(s.summary, contentWidth);
        lines.forEach((line: string) => {
          checkPageBreak(14);
          pdf.text(line, margin, y);
          y += 14;
        });
        y += 8;
      }

      // Additional paragraphs
      s.extra.forEach((entry) => {
        const text = entry.details || entry.title;
        if (text) {
          checkPageBreak(30);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(30, 35, 45);
          const lines = pdf.splitTextToSize(text, contentWidth);
          lines.forEach((line: string) => {
            checkPageBreak(14);
            pdf.text(line, margin, y);
            y += 14;
          });
          y += 8;
        }
      });

      // Sign off
      checkPageBreak(50);
      y += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(30, 35, 45);
      pdf.text("Sincerely,", margin, y);
      y += 18;
      pdf.setFont("helvetica", "bold");
      pdf.text(p.fullName || "Candidate", margin, y);
      y += 14;
    }

    // Attachments / Enclosures
    if (s.attachments && s.attachments.length > 0) {
      checkPageBreak(30);
      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(20, 24, 33);
      pdf.text("Enclosures & Attachments:", margin, y);
      y += 12;
      pdf.setFont("helvetica", "normal");
      s.attachments.forEach((att) => {
        checkPageBreak(12);
        pdf.text(`•  ${att}`, margin + 6, y);
        y += 12;
      });
    }

    const safeName = (p.fullName || "Cover_Letter").replace(/[^a-zA-Z0-9_-]/g, "_");
    pdf.save(filename || `${safeName}_Cover_Letter.pdf`);
    return;
  }

  // CV / RESUME FLOW
  // If CV has a cover letter, export Cover Letter on Page 1, then CV on subsequent pages
  if (doc.document_type === "cv" && s.cover_letter) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 35, 45);
    const lines = pdf.splitTextToSize(s.cover_letter, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(14);
      pdf.text(line, margin, y);
      y += 14;
    });

    if (s.attachments && s.attachments.length > 0) {
      checkPageBreak(30);
      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(20, 24, 33);
      pdf.text("Enclosures & Attachments:", margin, y);
      y += 12;
      pdf.setFont("helvetica", "normal");
      s.attachments.forEach((att) => {
        checkPageBreak(12);
        pdf.text(`•  ${att}`, margin + 6, y);
        y += 12;
      });
    }

    // Page break before CV Body
    pdf.addPage();
    y = margin;
  }

  drawHeader();

  // Professional Summary
  if (s.summary) {
    drawSectionHeading("Professional Summary");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(40, 45, 55);
    const summaryLines = pdf.splitTextToSize(s.summary, contentWidth);
    summaryLines.forEach((line: string) => {
      checkPageBreak(13);
      pdf.text(line, margin, y);
      y += 13;
    });
    y += 8;
  }

  // Skills
  if (s.skills.length > 0) {
    drawSectionHeading("Skills");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(40, 45, 55);
    const skillsText = s.skills.join("  ·  ");
    const skillLines = pdf.splitTextToSize(skillsText, contentWidth);
    skillLines.forEach((line: string) => {
      checkPageBreak(13);
      pdf.text(line, margin, y);
      y += 13;
    });
    y += 8;
  }

  // Experience
  if (s.experience.length > 0) {
    drawSectionHeading("Experience");
    s.experience.forEach((entry) => {
      checkPageBreak(30);

      // Title and Org
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(20, 24, 33);
      const titleOrg = [entry.title, entry.organization].filter(Boolean).join(" — ");
      pdf.text(titleOrg, margin, y);

      // Period (right aligned)
      const period = formatPeriod(entry.startDate, entry.endDate, entry.period);
      if (period) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(90, 96, 110);
        pdf.text(period, pageWidth - margin, y, { align: "right" });
      }
      y += 14;

      // Bullets
      entry.bullets.forEach((bullet) => {
        if (!bullet.trim()) return;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.25);
        pdf.setTextColor(40, 45, 55);

        const bulletIndent = 12;
        const bulletWidth = contentWidth - bulletIndent;
        const lines = pdf.splitTextToSize(bullet, bulletWidth);

        checkPageBreak(lines.length * 12.5 + 2);
        // Draw bullet dot
        pdf.text("•", margin + 2, y);

        lines.forEach((line: string) => {
          pdf.text(line, margin + bulletIndent, y);
          y += 12.5;
        });
        y += 1.5;
      });

      y += 5;
    });
    y += 4;
  }

  // Education
  if (s.education.length > 0) {
    drawSectionHeading("Education");
    s.education.forEach((entry) => {
      checkPageBreak(20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.75);
      pdf.setTextColor(20, 24, 33);
      pdf.text(entry.credential, margin, y);

      const period = formatPeriod(entry.startDate, entry.endDate, entry.period);
      if (period) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(90, 96, 110);
        pdf.text(period, pageWidth - margin, y, { align: "right" });
      }
      y += 12.5;

      if (entry.institution) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.25);
        pdf.setTextColor(60, 66, 80);
        pdf.text(entry.institution, margin, y);
        y += 13.5;
      }
      y += 3;
    });
    y += 4;
  }

  // Certifications
  if (s.certifications.length > 0) {
    drawSectionHeading("Certifications");
    s.certifications.forEach((entry) => {
      checkPageBreak(16);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(20, 24, 33);
      const nameText = entry.issuer ? `${entry.name} — ${entry.issuer}` : entry.name;
      pdf.text(`•  ${nameText}`, margin, y);

      if (entry.period) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(90, 96, 110);
        pdf.text(entry.period, pageWidth - margin, y, { align: "right" });
      }
      y += 13.5;
    });
    y += 6;
  }

  // Languages
  if (s.languages && s.languages.length > 0) {
    drawSectionHeading("Languages");
    checkPageBreak(16);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(40, 45, 55);
    const langText = s.languages
      .map((l) => (l.proficiency ? `${l.language} (${l.proficiency})` : l.language))
      .join("   ·   ");
    const langLines = pdf.splitTextToSize(langText, contentWidth);
    langLines.forEach((line: string) => {
      checkPageBreak(13);
      pdf.text(line, margin, y);
      y += 13;
    });
    y += 8;
  }

  // Additional
  if (s.extra.length > 0) {
    drawSectionHeading("Additional Information");
    s.extra.forEach((entry) => {
      checkPageBreak(25);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(20, 24, 33);

      const heading = [entry.type, entry.title].filter(Boolean).join(": ");
      pdf.text(`•  ${heading || entry.details}`, margin, y);

      if (entry.period) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(90, 96, 110);
        pdf.text(entry.period, pageWidth - margin, y, { align: "right" });
      }
      y += 12.5;

      if (entry.details && heading) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(60, 66, 80);
        const detailLines = pdf.splitTextToSize(entry.details, contentWidth - 12);
        detailLines.forEach((line: string) => {
          checkPageBreak(12);
          pdf.text(line, margin + 12, y);
          y += 12;
        });
      }
      y += 3;
    });
  }

  // References
  if (s.references && s.references.length > 0) {
    drawSectionHeading("References");
    s.references.forEach((entry) => {
      checkPageBreak(25);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(20, 24, 33);
      const heading = [entry.name, entry.title, entry.organization].filter(Boolean).join(" — ");
      pdf.text(`•  ${heading}`, margin, y);
      y += 12;

      const details = [entry.relationship, entry.email, entry.phone].filter(Boolean).join("   ·   ");
      if (details) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(80, 85, 95);
        pdf.text(details, margin + 10, y);
        y += 12;
      }
      y += 3;
    });
    y += 4;
  }

  // Enclosures & Attachments
  if (s.attachments && s.attachments.length > 0) {
    drawSectionHeading("Enclosures & Attachments");
    s.attachments.forEach((entry) => {
      checkPageBreak(15);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 35, 45);
      pdf.text(`•  ${entry}`, margin, y);
      y += 12.5;
    });
    y += 4;
  }

  const label = doc.document_type === "cv" ? "CV" : "Resume";
  const safeName = (p.fullName || "My").replace(/[^a-zA-Z0-9_-]/g, "_");
  pdf.save(filename || `${safeName}_${label}.pdf`);
}
