import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for moderation
  app.post("/api/moderate", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ isSafe: true, reason: null });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analise o texto a seguir e determine se ele contém conteúdo pornográfico, violência, crimes, assassinato ou "baixaria" (conteúdo ofensivo, vulgar ou impróprio para um aplicativo de moda praia profissional). 
        Considere que o aplicativo é da SOL & MAR (Lu Confecções), focado em gestão de moda praia.
        Responda APENAS em JSON com o seguinte formato:
        { "isSafe": boolean, "reason": string | null }
        
        Texto: "${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isSafe: { type: Type.BOOLEAN },
              reason: { type: Type.STRING, nullable: true }
            },
            required: ["isSafe"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        return res.json(result);
      }
      return res.json({ isSafe: true, reason: null });
    } catch (error: any) {
      console.error("Moderation error:", error);
      // Graceful fallback so user operations are not blocked
      return res.json({ isSafe: true, reason: null });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
