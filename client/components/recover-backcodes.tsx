"use client";
import type { SetStateAction } from "react";

import JsPDF from "jspdf";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { showError, showSuccess } from "@/lib/toast";

export function BackupCodes({ backUpCodes, setShowBackupCode }: { backUpCodes: string[]; setShowBackupCode: (value: SetStateAction<boolean>) => void }) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async (recoveryCodes: string[]) => {
    setIsGeneratingPdf(true);

    try {
      const pdf = new JsPDF("p", "mm", "a4");
      let yOffset = 20;

      pdf.setFontSize(20);
      pdf.text("Your 2FA Recovery Codes", 20, yOffset);
      yOffset += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text("IMPORTANT: Store these codes securely. Each code can be used only once.", 20, yOffset);
      yOffset += 15;

      pdf.setFontSize(14);
      pdf.setTextColor(0);

      recoveryCodes.forEach((code, index) => {
        if (yOffset > 280) {
          pdf.addPage();
          yOffset = 20;
        }
        pdf.text(`${index + 1}. ${code}`, 20, yOffset);
        yOffset += 10;
      });

      pdf.save("2fa_recovery_codes.pdf");
      showSuccess("Recovery codes PDF downloaded successfully!");
      setShowBackupCode(false);
    }
    catch (error) {
      console.error("Error generating PDF:", error);
      showError("Failed to generate PDF. Please try again.");
    }
    finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Card id="content-to-print">
      <CardHeader>
        <CardTitle>Backup Codes</CardTitle>
        <CardDescription>
          Save these codes in a secure place. Each code can be used once. When you lost your authenticator codes then those codes are used for backup login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {backUpCodes.map((code, i) => (
            <div
              key={i}
              className="p-2 bg-muted/50 rounded text-center font-mono"
            >
              {code}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleDownloadPdf(backUpCodes)} disabled={isGeneratingPdf}>
          {isGeneratingPdf ? "Downloading..." : "Download And Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
