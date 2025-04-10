import express from "express";
import { shopifyApp } from "@shopify/shopify-app-express";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

// Cấu hình database cho session storage
const sessionStorage = new PostgreSQLSessionStorage({
  connectionString: process.env.DATABASE_URL,
});

// Cấu hình Shopify App
const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: ["write_customers", "read_customers"],
    hostName: process.env.SHOPIFY_APP_URL.replace(/^https:\/\//, ""),
    apiVersion: "2024-01",
    isEmbeddedApp: true,
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
    webhooks: [
      {
        topic: "CUSTOMERS_CREATE",
        path: "/api/webhooks/customers/create",
      },
    ],
  },
  sessionStorage,
});

const app = express();
app.use(express.json());

// Áp dụng Shopify middleware
app.use(shopify.authenticate.admin());
app.use(shopify.webhooks.process());

// Route cập nhật metafield với xác thực
app.post("/api/update-metafield", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { customer_id, phone } = req.body;

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
    });

    res.status(200).json(response.body);
  } catch (error) {
    console.error("Update metafield failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// Xử lý webhook customers/create
shopify.webhooks.addHandlers({
  CUSTOMERS_CREATE: {
    deliveryMethod: "http",
    callbackUrl: "/api/webhooks/customers/create",
    callback: async (topic, shop, body) => {
      try {
        const customerId = body.id;
        const phone = body.phone || "";
        const session = await shopify.session.getOfflineSession(shop);
        
        const client = new shopify.api.clients.Rest({ session });
        await client.post({
          path: `customers/${customerId}/metafields`,
          data: {
            metafield: {
              namespace: "custom",
              key: "phone_number",
              type: "single_line_text_field",
              value: phone,
            },
          },
        });
      } catch (error) {
        console.error("Webhook handler error:", error);
      }
    },
  },
});

// Route chính
app.get("/", (_req, res) => {
  res.status(200).send("Shopify App hoạt động thành công 🚀");
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});