const BASE_URL = "https://premku.com/api";

export async function premku(endpoint, data = {}) {
  const apiKey = process.env.PREMKU_API_KEY;

  if (!apiKey) {
    throw new Error("PREMKU_API_KEY belum disetting di Vercel.");
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      api_key: apiKey,
      ...data
    })
  });

  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    result = {
      success: false,
      message: "Response dari API tidak valid."
    };
  }

  return {
    status: response.status,
    data: result
  };
}

export function response(res, result) {
  return res
    .status(result.status || 200)
    .json(result.data);
}