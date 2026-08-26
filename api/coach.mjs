const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};// =============================================
// 🚀 AMIRIJOGOS - ROCKET LEAGUE AI COACH
// Gemini API + Vercel
// =============================================


// =============================================
// CORS
// =============================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};


function applyCors(res) {

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }

}


// =============================================
// INSTRUÇÕES DO AI COACH
// =============================================

const COACH_INSTRUCTIONS = `
És o AMIRIJOGOS Rocket League AI Coach.

És um treinador amigável, claro e útil de Rocket League.

O teu objetivo é ajudar o jogador a melhorar no Rocket League.

Adapta sempre a resposta de acordo com:
- o rank do jogador
- os controlos utilizados
- a pergunta do jogador
- a mecânica que ele quer aprender

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
- Training routines


Quando ensinares uma mecânica:

1. Explica o que é.
2. Explica como fazer passo a passo.
3. Adapta os controlos ao dispositivo do jogador.
4. Mostra os erros mais comuns.
5. Dá um exercício para praticar.
6. Dá um objetivo mensurável para o jogador saber quando melhorou.


IMPORTANTE:

- Responde de forma simples.
- Não compliques demasiado as explicações.
- Podes usar emojis moderadamente.
- Se o jogador for iniciante, explica com mais calma.
- Se for um rank alto, podes dar dicas mais avançadas.
- Se o jogador escrever em português, responde em português.
- Se escrever em inglês, responde em inglês.
- Não recomendes cheats, hacks, scripts ou exploits.
`;


// =============================================
// API
// =============================================

export default async function handler(req, res) {

  // Aplicar CORS a TODAS as respostas
  applyCors(res);


  // ===========================================
  // PREFLIGHT CORS
  // ===========================================

  if (req.method === "OPTIONS") {

    return res
      .status(204)
      .end();

  }


  // ===========================================
  // APENAS POST
  // ===========================================

  if (req.method !== "POST") {

    return res
      .status(405)
      .json({
        error: "Esta API só aceita pedidos POST."
      });

  }


  try {

    // =========================================
    // VERIFICAR API KEY
    // =========================================

    if (!process.env.GEMINI_API_KEY) {

      console.error(
        "GEMINI_API_KEY não está configurada no Vercel."
      );

      return res
        .status(500)
        .json({
          error:
            "A chave do Gemini não está configurada no servidor."
        });

    }


    // =========================================
    // LER BODY
    // =========================================

    let body = req.body || {};


    // Caso o Vercel envie o body como texto
    if (typeof body === "string") {

      try {

        body = JSON.parse(body);

      } catch {

        return res
          .status(400)
          .json({
            error: "Pedido inválido."
          });

      }

    }


    const {
      rank = "Diamond",
      controls = "Controller",
      messages = []
    } = body;


    // =========================================
    // VALIDAR RANK
    // =========================================

    const allowedRanks = [

      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Champion",
      "Grand Champion",
      "SSL"

    ];


    const safeRank =
      allowedRanks.includes(rank)
        ? rank
        : "Diamond";


    // =========================================
    // VALIDAR CONTROLOS
    // =========================================

    const allowedControls = [

      "Controller",
      "Keyboard and Mouse"

    ];


    const safeControls =
      allowedControls.includes(controls)
        ? controls
        : "Controller";


    // =========================================
    // HISTÓRICO DA CONVERSA
    // =========================================

    const recentMessages =
      Array.isArray(messages)
        ? messages.slice(-10)
        : [];


    const conversation =
      recentMessages
        .map(message => {

          const role =
            message?.role === "assistant"
              ? "Coach"
              : "Jogador";


          const content =
            String(
              message?.content || ""
            )
              .slice(0, 2000);


          return `${role}: ${content}`;

        })
        .join("\n\n");


    // =========================================
    // PROMPT PARA O GEMINI
    // =========================================

    const prompt = `
${COACH_INSTRUCTIONS}

==============================

PERFIL DO JOGADOR

Rank:
${safeRank}

Controlos:
${safeControls}

==============================

CONVERSA

${conversation || "O jogador ainda não fez nenhuma pergunta."}

==============================

Responde agora como o AMIRIJOGOS Rocket League AI Coach.
`;


    // =========================================
    // PEDIDO AO GEMINI
    // =========================================

    const geminiResponse =
      await fetch(

        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "x-goog-api-key":
              process.env.GEMINI_API_KEY

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


    // =========================================
    // LER RESPOSTA DO GEMINI
    // =========================================

    let data;


    try {

      data =
        await geminiResponse.json();

    } catch {

      console.error(
        "O Gemini devolveu uma resposta inválida."
      );

      return res
        .status(502)
        .json({
          error:
            "O Gemini devolveu uma resposta inválida."
        });

    }


    // =========================================
    // ERRO DO GEMINI
    // =========================================

    if (!geminiResponse.ok) {

      console.error(
        "Gemini API Error:",
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


    // =========================================
    // EXTRAIR TEXTO
    // =========================================

    const reply =

      data?.candidates?.[0]
        ?.content?.parts
        ?.map(part =>
          part?.text || ""
        )
        .join("")
        .trim();


    // =========================================
    // SEM RESPOSTA
    // =========================================

    if (!reply) {

      console.error(
        "Gemini respondeu sem texto:",
        JSON.stringify(data)
      );


      return res
        .status(500)
        .json({

          error:
            "O Gemini não devolveu uma resposta."

        });

    }


    // =========================================
    // SUCESSO
    // =========================================

    return res
      .status(200)
      .json({

        reply: reply

      });


  } catch (error) {

    // =========================================
    // ERRO INTERNO
    // =========================================

    console.error(
      "Erro no AI Coach:",
      error
    );


    return res
      .status(500)
      .json({

        error:
          "Erro interno do AI Coach."

      });

  }

}

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
