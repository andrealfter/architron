import express from "express";
import fetch from "node-fetch";
import { promises as fs } from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

async function fetchHumanitecData() {
  const url = `https://api.humanitec.io/orgs/${process.env.HUMANITEC_ORG}/apps/${process.env.HUMANITEC_APP}/envs/${process.env.HUMANITEC_ENV}/resources`;

  console.log("Fetching data from URL:", url);
  console.log("Using token:", process.env.HUMANITEC_TOKEN);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.HUMANITEC_TOKEN}`,
    },
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("Error response body:", responseBody);
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${responseBody}`,
    );
  }

  return await response.json();
}

app.get("/get-resources", async (req, res) => {
  try {
    console.log("Received request to fetch and store data");
    const data = await fetchHumanitecData();
    console.log("Data fetched successfully");

    await fs.writeFile("humanitec_data.json", JSON.stringify(data, null, 2));
    console.log("Data written to file successfully");

    res.json({ message: "Data fetched and stored successfully" });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({
      error: "An error occurred while fetching data",
      details: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Environment variables loaded:");
  console.log("HUMANITEC_ORG:", process.env.HUMANITEC_ORG);
  console.log("HUMANITEC_APP:", process.env.HUMANITEC_APP);
  console.log("HUMANITEC_ENV:", process.env.HUMANITEC_ENV);
  console.log(
    "HUMANITEC_TOKEN:",
    process.env.HUMANITEC_TOKEN ? "[SET]" : "[NOT SET]",
  );
});
