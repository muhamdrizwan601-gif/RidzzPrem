import { premku, response } from "./_premku.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan."
    });
  }

  const product_id = Number(req.body?.product_id);
  const qty = Number(req.body?.qty);
  const ref_id = String(req.body?.ref_id || "").trim();

  if (!Number.isInteger(product_id) || product_id < 1) {
    return res.status(400).json({
      success: false,
      message: "Product ID tidak valid."
    });
  }

  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({
      success: false,
      message: "Jumlah order minimal 1."
    });
  }

  if (!ref_id) {
    return res.status(400).json({
      success: false,
      message: "Ref ID wajib diisi."
    });
  }

  try {
    const result = await premku("order", {
      product_id,
      qty,
      ref_id
    });

    return response(res, result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}