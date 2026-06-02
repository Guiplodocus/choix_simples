module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const payload = req.body || {};
  const answer = String(payload.answer || "").trim();
  const date = String(payload.date || "").trim();
  const time = String(payload.time || "").trim();
  const location = String(payload.location || "").trim();
  const submittedAt = String(payload.submittedAt || new Date().toISOString()).trim();

  console.log("[admin-submit]", {
    answer,
    date,
    time,
    location,
    submittedAt,
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!adminEmail || !resendApiKey) {
    return res.status(200).json({
      ok: true,
      emailed: false,
      logged: true,
      reason: "Missing ADMIN_EMAIL or RESEND_API_KEY",
    });
  }

  const subject = "Nouveau submit - Dragouille";
  const text = [
    "Nouvelle reponse recue:",
    `- Reponse: ${answer || "(vide)"}`,
    `- Date: ${date || "(vide)"}`,
    `- Heure: ${time || "(vide)"}`,
    `- Lieu: ${location || "(vide)"}`,
    `- Envoye le: ${submittedAt}`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[admin-submit-email-error]", errorText);
      return res.status(200).json({ ok: true, emailed: false, logged: true });
    }

    return res.status(200).json({ ok: true, emailed: true, logged: true });
  } catch (error) {
    console.error("[admin-submit-email-exception]", error);
    return res.status(200).json({ ok: true, emailed: false, logged: true });
  }
};
