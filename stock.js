import { premku, response } from "./_premku.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan."
    });
  }

  const product_id = Number(req.body?.product_id);

  if (!Number.isInteger(product_id) || product_id < 1) {
    return res.status(400).json({
      success: false,
      message: "Product ID tidak valid."
    });
  }

  try {
    const result = await premku("stock", {
      product_id
    });

    return response(res, result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}