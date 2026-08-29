// api/products.js
// RIDZZPREM - Product API
// Harga jual = harga modal + 25% keuntungan

const BASE_URL = "https://premku.com/api";

export default async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }

    try {
        const apiKey = process.env.PREMKU_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "PREMKU_API_KEY belum disetting di Vercel."
            });
        }

        const response = await fetch(`${BASE_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: apiKey
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            return res.status(response.status || 400).json(result);
        }

        // ==============================
        // KEUNTUNGAN RIDZZPREM
        // ==============================
        const PROFIT_PERCENT = 25;

        const products = (result.products || []).map(product => {
            const modal = Number(product.price) || 0;

            // Modal + 25%
            const hargaJual = Math.ceil(
                modal * (1 + PROFIT_PERCENT / 100)
            );

            return {
                id: product.id,
                name: product.name,
                description: product.description || "",
                price: hargaJual,
                stock: Number(product.stock) || 0,
                status: product.status,
                image: product.image || null,

                // Informasi keuntungan untuk kebutuhan internal/frontend
                // Jangan tampilkan modal kepada customer.
                profit_percent: PROFIT_PERCENT
            };
        });

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.error("Products API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data produk.",
            error: error.message
        });
    }
}