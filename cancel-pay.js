import { premku, response } from "./_premku.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan."
    });
  }

  const invoice = String(req.body?.invoice || "").trim();

  if (!invoice) {
    return res.status(400).json({
      success: false,
      message: "Invoice deposit wajib diisi."
    });
  }

  try {
    const result = await premku("cancel_pay", {
      invoice
    });

    return response(res, result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}