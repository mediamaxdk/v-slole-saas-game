import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/db";
import { sendEmail } from "@/lib/email";

// POST /api/kontakt — kontaktformular for whitelabel-forespørgsler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { name, email, school, studentCount, domain, message } = body;
    
    // Validering
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Navn, email og besked er påkrævet" },
        { status: 400 }
      );
    }
    
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Ugyldig email-adresse" },
        { status: 400 }
      );
    }
    
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Besked skal være mindst 10 tegn" },
        { status: 400 }
      );
    }
    
    // Gem i database
    const [contactMessage] = await db.insert(contactMessages).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      school: school?.trim() || null,
      studentCount: studentCount?.trim() || null,
      message: message.trim(),
    }).returning();
    
    // Send email notifikation til admin
    const adminEmail = process.env.ADMIN_EMAIL || "info@v-skole.dk";
    
    const emailHtml = `
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6ff; margin: 0; padding: 32px 16px; }
    .card { background: #fff; border-radius: 12px; max-width: 600px; margin: 0 auto; padding: 40px 32px; }
    .logo { font-size: 24px; font-weight: 800; color: #3340f5; margin-bottom: 24px; }
    .field { margin-bottom: 16px; }
    .label { font-weight: 600; color: #374151; margin-bottom: 4px; }
    .value { color: #6b7280; }
    .message { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px; }
    a { color: #3340f5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⌨️ Tastatur Helten</div>
    
    <h2 style="margin:0 0 24px">Ny whitelabel-forespørgsel</h2>
    
    <div class="field">
      <div class="label">Navn:</div>
      <div class="value">${name}</div>
    </div>
    
    <div class="field">
      <div class="label">Email:</div>
      <div class="value">${email}</div>
    </div>
    
    ${school ? `
    <div class="field">
      <div class="label">Skole/Organisation:</div>
      <div class="value">${school}</div>
    </div>
    ` : ''}
    
    ${studentCount ? `
    <div class="field">
      <div class="label">Antal elever:</div>
      <div class="value">${studentCount}</div>
    </div>
    ` : ''}
    
    ${domain ? `
    <div class="field">
      <div class="label">Ønsket domæne:</div>
      <div class="value">${domain}</div>
    </div>
    ` : ''}
    
    <div class="field">
      <div class="label">Besked:</div>
      <div class="message">${message.replace(/\n/g, '<br>')}</div>
    </div>
    
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        Denne besked blev sendt via kontaktformularen på Tastatur Helten.<br>
        ID: ${contactMessage.id}<br>
        Tidspunkt: ${new Date().toLocaleString("da-DK")}
      </p>
    </div>
  </div>
</body>
</html>`;
    
    await sendEmail({
      to: adminEmail,
      subject: `Ny whitelabel-forespørgsel: ${name} (${school || 'Privat'})`,
      html: emailHtml,
    });
    
    return NextResponse.json({ 
      message: "Besked sendt! Vi kontakter dig inden for 24 timer.",
      id: contactMessage.id 
    });
    
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Kunne ikke sende besked" },
      { status: 500 }
    );
  }
}
