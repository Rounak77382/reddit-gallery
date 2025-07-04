import { NextResponse } from "next/server";
import snoowrap from "snoowrap";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Get the host from the request URL
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  try {
    const r = await snoowrap.fromAuthCode({
      code: code,
      userAgent: "testscript by RS_ted",
      clientId: process.env.praw_api_client_id,
      clientSecret: process.env.praw_api_client_secret,
      redirectUri: redirectUri,
    });

    const userdetails = await r.getMe();
    const userPrefs = await r.getPreferences();

    const name = userdetails.name;
    const dp = userdetails.icon_img;
    const isUserAdult = userPrefs["over_18"];

    // Create a secure token object containing only what's needed
    const secureToken = {
      accessToken: r.accessToken,
      refreshToken: r.refreshToken,
      tokenExpiration: Date.now() + (r.tokenExpiration || 3600) * 1000,
      scope: r.scope || null,
    };

    // Return HTML that posts the Reddit instance to parent window
    return new Response(
      `<html>
                <body>
                    <script>
                        window.opener.postMessage({
                            type: 'oauth-callback',
                            r: ${JSON.stringify(secureToken)},
                            name: ${JSON.stringify(name)},
                            dp: ${JSON.stringify(dp)},
                            isUserAdult: ${JSON.stringify(isUserAdult)},
                        }, '*');
                        window.close();
                    </script>
                </body>
            </html>`,
      {
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'unsafe-inline'",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
