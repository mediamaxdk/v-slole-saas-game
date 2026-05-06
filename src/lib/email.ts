import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY mangler — emails sendes ikke");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM ?? "Tastatur Helten <noreply@tastaturhelten.dk>";

  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    console.error("Email-fejl:", error);
    throw new Error(`Kunne ikke sende email: ${error.message}`);
  }

  return data;
}
