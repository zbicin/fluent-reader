import { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    if (!body.phrase) {
        return new Response(JSON.stringify({ message: "Bad Request: 'phrase' property is missing." }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Bad Request: Invalid JSON payload." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
  }

  const responseObject = { translation: "przyjąć, zaakceptować" };

  return new Response(JSON.stringify(responseObject), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};

export const config: Config = {
  path: "/api/translation"
};
