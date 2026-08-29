import { premku, response } from "./_premku.js";

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan."
    });
  }

  try {
    const result = await premku("profile");

    return response(res, result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}