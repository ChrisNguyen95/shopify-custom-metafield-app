import express from "express";
import { shopifyApp } from "@shopify/shopify-app-express";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: ["write_customers", "read_customers"],
    hostName: process.env.SHOPIFY_APP_URL.replace(/^https:\/\//, ""),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
});

const app = express();
app.use(express.json());

// Use these middleware functions instead of configureRoutes
app.use(shopify.auth.begin());
app.use(shopify.auth.callback());
app.use(shopify.webhooks.path, shopify.webhooks.process);

// === API: Update Metafield Manually ===
app.post("/api/update-metafield", async (req, res) => {
  const session = await shopify.session.getCurrentSession(req, res);
  const { customer_id, phone } = req.body;

  try {
    const client = new shopify.api.clients.Rest({ session });
    const response = await client.post({
      path: `customers/${customer_id}/metafields`,
      data: {
        metafield: {
          namespace: "custom",
          key: "phone_number",
          type: "single_line_text_field",
          value: phone,
        },
      },
      type: "application/json",
    });
    res.status(200).json({ success: true, data: response.body });
  } catch (error) {
    console.error("Metafield update failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Webhook: Customer Created ===
app.post("/api/webhooks", shopify.processWebhooks());

// Root route
app.get("/", (_req, res) => {
  res.status(200).send("Shopify Custom App is running 🚀");
});

app.listen(PORT, () => {
  console.log(`> Ready on http://localhost:${PORT}`);
});
