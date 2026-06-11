const { getStore } = require("@netlify/blobs");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sivaslıpars2026";
const STORE_NAME = "kubra-dogurdu-mu";
const STATUS_KEY = "status";

const DEFAULT_STATUS = {
  dogurdu: false,
  updatedAt: null,
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

async function readStatus(store) {
  const status = await store.get(STATUS_KEY, { type: "json" });

  if (!status) {
    return DEFAULT_STATUS;
  }

  return {
    dogurdu: Boolean(status.dogurdu),
    updatedAt: status.updatedAt || null,
  };
}

exports.handler = async (event) => {
  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    return json(200, await readStatus(store));
  }

  if (event.httpMethod === "POST") {
    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch (error) {
      return json(400, { error: "Geçersiz JSON" });
    }

    if (body.password !== ADMIN_PASSWORD) {
      return json(401, { error: "Şifre yanlış" });
    }

    if (typeof body.dogurdu !== "boolean") {
      return json(400, { error: "dogurdu boolean olmalı" });
    }

    const nextStatus = {
      dogurdu: body.dogurdu,
      updatedAt: new Date().toISOString(),
    };

    await store.setJSON(STATUS_KEY, nextStatus);
    return json(200, nextStatus);
  }

  return json(405, { error: "Method desteklenmiyor" });
};
