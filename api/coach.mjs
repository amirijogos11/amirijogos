const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function applyCors(res) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }
}

const COACH_INSTRUCTIONS = `
És o AMIRIJOGOS Rocket League AI Coach.

És um treinador amigável de Rocket League.

Adapta sempre a resposta ao:
- rank do jogador
- tipo de controlos
- nível da pergunta

Podes ensinar:
- Wave Dash
- Fast Aerial
- Half Flip
- Speed Flip
- Air Dribble
- Double Tap
- Dribbling
- Flicks
- Aerials
- Recoveries
- Rotations
- Positioning
- Kickoffs
- Shooting
- Defence
- Boost management

Quando ensinares uma mecânica:
1. Explica o que é.
2. Dá passos simples e numerados.
3. Adapta aos controlos do jogador.
4. Explica erros comuns.
5. Dá um exercício de treino.
6. Dá um objetivo para medir o progresso.

Se o jogador escrever em português, responde em português.
Se escrever em inglês, responde em inglês.

Não recomendes cheats, hacks, scripts ou exploits.
`;

export default async function handler(req, res) {

  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Esta API só aceita pedidos POST."
    });
  }

  try {

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não está configurada no Vercel."
      });
    }

    let body = req.body || {};

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: "Pedido inválido."
        });
      }
    }

    const {
      rank = "Diamond",
      controls = "Controller",
      messages = []
    } = body;

    const recentMessages =
      Array.isArray(messages)
        ? messages.slice(-10)
        : [];

    const conversation = recentMessages
      .map(message => {

        const role =
          message?.role === "assistant"
            ? "Coach"
            : "Jogador";

        const content =
          String(message?.content || "")
            .slice(0, 2000);

        return `${role}: ${content}`;
      })
      .join("\n\n");

    const prompt = `
${COACH_INSTRUCTIONS}

PERFIL DO JOGADOR

Rank: ${rank}
Controlos: ${controls}

CONVERSA:

${conversation}

Responde agora como treinador de Rocket League.
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {

      console.error(
        "Gemini error:",
        JSON.stringify(data)
      );

      return res
        .status(geminiResponse.status)
        .json({
          error:
            data?.error?.message ||
            "Erro ao contactar o Gemini."
        });
    }

    const reply =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(part => part?.text || "")
        .join("")
        .trim();

    if (!reply) {
      return res.status(500).json({
        error: "O Gemini não devolveu uma resposta."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(
      "AI Coach error:",
      error
    );

    return res.status(500).json({
      error: "Erro interno do AI Coach."
    });
  }
}
