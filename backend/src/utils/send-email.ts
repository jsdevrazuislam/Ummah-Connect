import ApiError from "@/utils/api-error";

/**
 * Sends an email using the configured API instance.
 *
 * @param {string} subject - The subject line of the email.
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {object} params - An object containing parameters to be used within the email template.
 * @param {number} templateId - The ID of the email template to be used.
 * @returns {Promise<void | ApiError>} A Promise that resolves if the email is sent successfully,
 * or rejects with an `ApiError` if an error occurs during the email sending process.
 */
export async function sendEmail(subject: string, email: string, name: string, params: object, templateId: number) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.SMTP_TOKEN ?? "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: [
          {
            email,
            name,
          },
        ],
        subject,
        templateId,
        params,
        headers: {
          "X-Mail-Tag": "custom-tag-id-1234",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send email:", errorData);
      throw new ApiError(response.status, errorData.message || "Unknown email error");
    }

    const data = await response.json();
    console.log("Email sent successfully:", data);
  }
  catch {
    throw new ApiError(500, "Failed to send email");
  }
}
