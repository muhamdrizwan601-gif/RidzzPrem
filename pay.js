import { premku, response } from "./_premku.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan."
    });
  }

  const amount = Number(req.body?.amount);

  if (!Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({
      success: false,
      message: "Nominal deposit tidak valid."
    });
  }

  try {
    const result = await premku("pay", {
      amount
    });

    return response(res, result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}