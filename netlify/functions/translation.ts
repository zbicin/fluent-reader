import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.phrase) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request: 'phrase' property is missing." }),
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Bad Request: Invalid JSON payload." }),
    };
  }


  return {
    statusCode: 200,
    body: "przyjąć, zaakceptować",
    headers: {
        'Content-Type': 'text/plain; charset=utf-8'
    }
  };
};

export { handler };
