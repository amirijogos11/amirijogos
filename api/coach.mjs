const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

const COACH_INSTRUCTIONS = `
És um treinador amigável de Rocket League.

Ajuda o jogador a melhorar de acordo com:
- o rank
- os controlos que utiliza
- a mecânica que quer aprender

Ensina coisas como:
Wave Dash
Fast Aerial
Half Flip
Speed Flip
Air Dribble
Double Tap
Dribbling
Flicks
Rotations
Positioning

Responde de forma simples e clara.

Quando ensinares uma mecânica:
1. explica como fazer
2. dá passos numerados
3. explica erros comuns
4. dá um exercício de treino
5. dá um objetivo mensurável

Não recomendes cheats, hacks ou exploits.
`;

export default async function handler(req, res) {

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .setHeader("Allow", "POST")
      .json({
        error: "Method not allowed"
      });
  }

  try {

    const {
      rank = "Diamond",
      controls = "Controller",
      messages = []
    } = req.body || {};

    const recentMessages =
      Array.isArray(messages)
        ? messages.slice(-10)
        : [];

    const conversation = recentMessages
      .map(message => {

        const role =
          message.role === "assistant"
            ? "Coach"
            : "Jogador";

        const content =
          String(message.content || "")
            .slice(0, 2000);

        return `${role}: ${content}`;

      })
      .join("\n");

    const prompt = `
${COACH_INSTRUCTIONS}

Perfil do jogador:
Rank: ${rank}
Controlos: ${controls}

Conversa:
${conversation}

Responde como treinador de Rocket League.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key":
            process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
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

    const data = await response.json();

    if (!response.ok) {

      console.error(
        "Gemini error:",
        data
      );

      return res
        .status(response.status)
        .json({
          error:
            data?.error?.message ||
            "Erro ao contactar o Gemini."
        });

    }

    const reply =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {

      return res
        .status(500)
        .json({
          error:
            "O Gemini não devolveu uma resposta."
        });

    }

    return res
      .status(200)
      .json({
        reply
      });

  } catch (error) {

    console.error(error);

    return res
      .status(500)
      .json({
        error:
          "Erro interno do servidor."
      });

  }

}
