import express from "express";
import { shopifyApp } from "@shopify/shopify-app-express";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

// Setup Shopify App
const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: ["write_customers", "read_customers"],
    hostName: process.env.SHOPIFY_APP_URL.replace(/^https:\/\//, ""),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
    restResources,
    // (optional) enable future flags
    future: {
      unstable_managedPricingSupport: true,
      customerAddressDefaultFix: true,
    },
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

// Shopify middleware
app.use(shopify.middleware());
app.use(express.json());

/**
 * === API: Update Customer Metafield ===
 * @body: { customer_id, phone }
 */
app.post("/api/update-metafield", async (req, res) => {
  const session = await shopify.session.getCurrentSession(req, res, true);

  if (!session) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

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

/**
 * === Webhook: Customer Created ===
 * Automatically add phone to metafield
 */
app.post("/api/webhooks/customers/create", async (req, res) => {
  try {
    const body = req.body;
    const customerId = body.id;
    const phone = body.phone;
    const shop = req.headers["x-shopify-shop-domain"];

    const session = await shopify.session.getOfflineSession(shop);
    const client = new shopify.api.clients.Rest({ session });

    await client.post({
      path: `customers/${customerId}/metafields`,
      data: {
        metafield: {
          namespace: "custom",
          key: "phone_number",
          type: "single_line_text_field",
          value: phone || "",
        },
      },
      type: "application/json",
    });

    res.status(200).send("Webhook handled");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook failed");
  }
});

// Root route
app.get("/", (_req, res) => {
  res.status(200).send("🚀 Shopify Custom App is running!");
