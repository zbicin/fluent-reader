import { Config, Context } from '@netlify/functions';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');
  const token = url.searchParams.get('token');
  const contentType = url.searchParams.get('contentType') || 'text/html';

  if (!targetUrl || !token) {
    return new Response(
      JSON.stringify({ message: "Bad Request: 'url' and 'token' parameters are required." }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const browserlessUrl = `https://production-ams.browserless.io/chrome/content?blockAds=true&timeout=60000&stealth&token=${token}`;
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: targetUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          message: `Failed to fetch content from browserless.io: ${errorText}`,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await response.text();
    const doc = new JSDOM(html, {
      url: targetUrl,
    });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article) {
        return new Response(JSON.stringify({ message: 'Failed to parse article content.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    const sanitizer = DOMPurify(doc.window as unknown as Window);
    const cleanContent = sanitizer.sanitize(article.content);

    return new Response(cleanContent, {
      status: 200,
      headers: { 'Content-Type': `${contentType}; charset=utf-8` },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const config: Config = {
  path: '/api/makeReadable',
};
