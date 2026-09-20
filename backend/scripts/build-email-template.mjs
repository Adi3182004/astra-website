import fs from "fs";

const dataUri = fs.readFileSync("backend/templates/logo-data-uri.txt", "utf-8").trim();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password — PRIORA by KP</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #FAF7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" style="max-width: 500px; width: 100%; background-color: #FFFFFF; border: 1px solid rgba(240, 106, 105, 0.25); border-radius: 24px; padding: 44px 32px; text-align: center; box-shadow: 0 8px 30px rgba(240, 106, 105, 0.08);">
          
          <!-- Embedded Rose Logo SVG -->
          <tr>
            <td align="center" style="padding-bottom: 6px;">
              <img src="${dataUri}" alt="PRIORA" width="220" style="display: block; width: 220px; max-width: 85%; height: auto; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="font-size: 10.5px; letter-spacing: 3.5px; color: #C08A2E; text-transform: uppercase; font-weight: 600;">
                BY KP &middot; INFINITE ELEGANCE
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="height: 1px; width: 48px; background-color: #f06a69; margin: 0 auto; opacity: 0.6;"></div>
            </td>
          </tr>

          <!-- Heading & Message -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #1F1D24; letter-spacing: -0.2px;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #5C5764; max-width: 380px;">
                We received a request to reset the password for your PRIORA account. Click the button below to choose your new password.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #f06a69; color: #FFFFFF !important; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; padding: 14px 34px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(240, 106, 105, 0.35);">
                Set New Password
              </a>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8C8694;">
                This link will expire soon. If you didn’t request a password reset, you can safely ignore this email — your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid #F0ECE9; padding-top: 20px;">
              <p style="margin: 0; font-size: 11px; color: #A09AA6; letter-spacing: 0.5px;">
                &copy; PRIORA by KP &middot; Handcrafted Fine Jewelry
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

fs.writeFileSync("backend/templates/reset-password-email.html", html);
console.log("Written reset-password-email.html with embedded data URI logo");
