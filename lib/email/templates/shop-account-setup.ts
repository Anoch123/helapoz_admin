import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

interface ShopAccountSetupEmailInput {
  fullName: string;
  shopName: string;
  shopCode: string;
  role: "SHOP_ADMIN" | "SHOP_USER";
  setupUrl: string;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function createShopAccountSetupEmail({
  fullName,
  shopName,
  shopCode,
  role,
  setupUrl,
}: ShopAccountSetupEmailInput) {
  const safeName = escapeHtml(fullName);
  const safeShopName = escapeHtml(shopName);
  const safeShopCode = escapeHtml(shopCode);
  const safeRole = escapeHtml(
    role === "SHOP_ADMIN" ? "Shop Administrator" : "Shop User",
  );

  const safeSetupUrl = escapeHtml(setupUrl);

  const subject = `Welcome to ${BASICSYSTEMDATA.appName} - Your ${safeRole} account`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:30px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
        <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;padding:32px;">
          <h1 style="margin-top:0;">Welcome to ${BASICSYSTEMDATA.appName}</h1>

          <p>Hello ${safeName},</p>

          <p>
            Your account has been created for
            <strong>${safeShopName}</strong>.
          </p>

          <p><strong>Account details</strong></p>

          <p>
            Shop code: <strong>${safeShopCode}</strong><br/>
            Account type: <strong>${safeRole}</strong>
          </p>

          <p>
            Set your password using the secure button below.
          </p>

          <a
            href="${safeSetupUrl}"
            style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:bold;"
          >
            Set My Password
          </a>

          <p style="margin-top:24px;font-size:13px;color:#71717a;">
            This is a one-time account setup link. If you were not expecting
            this email, please contact ${BASICSYSTEMDATA.appName} support.
          </p>

          <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0;"/>

          <p style="font-size:12px;color:#a1a1aa;">
            ${BASICSYSTEMDATA.appName} POS · Business Management Made Simple
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to ${BASICSYSTEMDATA.appName}

Hello ${fullName},

Your account has been created for ${shopName}.

Shop code: ${shopCode}
Account type: ${role === "SHOP_ADMIN" ? "Shop Administrator" : "Shop User"}

Set your password using this secure link:
${setupUrl}

If you were not expecting this email, please contact ${BASICSYSTEMDATA.appName} support.

${BASICSYSTEMDATA.appName} POS
Business Management Made Simple
  `.trim();

  return {
    subject,
    html,
    text,
  };
}