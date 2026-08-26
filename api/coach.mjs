// =============================================
// 🚀 AMIRIJOGOS - ROCKET LEAGUE AI COACH
// Gemini API + Vercel
// =============================================


// =============================================
// CORS
// =============================================

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


// =============================================
// ESPERAR
// =============================================

function sleep(ms) {

  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });

}


// =============================================
// MODELOS GEMINI
// =============================================

const MODELS = [

  "gemini-3.5-flash-lite",

  "gemini-3.1-flash-lite",

  "gemini-3.5-flash"

];


// =============================================
// INSTRUÇÕES DO COACH
// =============================================

const COACH_INSTRUCTIONS = `

És o AMIRIJOGOS Rocket League AI Coach.

És um treinador amigável, claro e útil de Rocket League.

O teu objetivo é ajudar o jogador a melhorar no Rocket League.

Adapta sempre a resposta de acordo com:

- o rank do jogador
- os controlos que utiliza
- a pergunta
- a mecânica que quer aprender


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
- Boost Management
- Training Routines


Quando ensinares uma mecânica:

1. Explica o que é.
2. Explica passo a passo.
3. Adapta a explicação aos controlos do jogador.
4. Mostra os erros mais comuns.
5. Dá um exercício para praticar.
6. Dá um objetivo mensurável.


REGRAS:

- Responde de forma simples.
- Não compliques desnecessariamente.
- Podes usar alguns emojis.
- Para ranks baixos, explica com mais calma.
- Para ranks altos, podes dar dicas avançadas.
- Se a pergunta estiver em português, responde em português.
- Se estiver em inglês, responde em inglês.
- Não recomendes cheats, hacks, scripts ou exploits.

`;


// =============================================
// FUNÇÃO PARA CHAMAR O GEMINI
// =============================================

async function callGemini(model, prompt, apiKey) {

  const response = await fetch(

    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,

    {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "x-goog-api-key": apiKey

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


  let data;


  try {

    data = await response.json();

  } catch {

    data = {
      error: {
        message:
          "O Gemini devolveu uma resposta inválida."
      }
    };

  }


  return {

    response,

    data

  };

}


// =============================================
// API PRINCIPAL
// =============================================

export default async function handler(req, res) {

  applyCors(res);


  // ===========================================
  // CORS PREFLIGHT
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

        error:
          "Esta API só aceita pedidos POST."

      });

  }


  try {


    // =========================================
    // API KEY
    // =========================================

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      console.error(
        "GEMINI_API_KEY não encontrada."
      );


      return res
        .status(500)
        .json({

          error:
            "A chave Gemini não está configurada no Vercel."

        });

    }


    // =========================================
    // BODY
    // =========================================

    let body =
      req.body || {};


    if (typeof body === "string") {

      try {

        body =
          JSON.parse(body);

      } catch {

        return res
          .status(400)
          .json({

            error:
              "Pedido inválido."

          });

      }

    }


    // =========================================
    // DADOS DO JOGADOR
    // =========================================

    const {

      rank = "Diamond",

      controls = "Controller",

      messages = []

    } = body;


    // =========================================
    // RANK SEGURO
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
    // CONTROLOS SEGUROS
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
    // HISTÓRICO
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

              .slice(
                0,
                2000
              );


          return `${role}: ${content}`;


        })

        .join("\n\n");


    // =========================================
    // PROMPT
    // =========================================

    const prompt = `

${COACH_INSTRUCTIONS}


===============================

PERFIL DO JOGADOR

Rank:
${safeRank}

Controlos:
${safeControls}


===============================

CONVERSA

${conversation || "Sem mensagens anteriores."}


===============================

Responde agora como o
AMIRIJOGOS Rocket League AI Coach.

`;


    // =========================================
    // TENTAR VÁRIOS MODELOS
    // =========================================

    let lastError =
      "Nenhum modelo Gemini respondeu.";


    for (const model of MODELS) {


      // Cada modelo pode tentar 2 vezes
      for (
        let attempt = 1;
        attempt <= 2;
        attempt++
      ) {


        console.log(
          `A tentar ${model} - tentativa ${attempt}`
        );


        let result;


        try {

          result =
            await callGemini(
              model,
              prompt,
              apiKey
            );

        } catch (networkError) {


          console.error(
            "Erro de rede:",
            networkError
          );


          lastError =
            "Erro de ligação ao Gemini.";


          continue;

        }


        const {
          response,
          data
        } = result;


        // =====================================
        // SUCESSO
        // =====================================

        if (response.ok) {


          const reply =

            data?.candidates?.[0]
              ?.content?.parts

              ?.map(
                part =>
                  part?.text || ""
              )

              .join("")

              .trim();


          if (reply) {


            console.log(
              `Resposta recebida de ${model}`
            );


            return res
              .status(200)
              .json({

                reply: reply,

                model: model

              });

          }


          lastError =
            "O Gemini respondeu sem texto.";


          break;

        }


        // =====================================
        // GUARDAR ERRO
        // =====================================

        lastError =

          data?.error?.message ||

          `Erro Gemini ${response.status}`;


        console.error(
          `${model}:`,
          response.status,
          lastError
        );


        // =====================================
        // MODELO SOBRECARREGADO
        // =====================================

        if (
          response.status === 503 ||
          response.status === 429
        ) {


          // esperar antes da segunda tentativa

          if (attempt === 1) {

            await sleep(700);

            continue;

          }


          // depois tenta outro modelo

          break;

        }


        // =====================================
        // MODELO NÃO ENCONTRADO
        // =====================================

        if (response.status === 404) {

          break;

        }


        // =====================================
        // ERRO DE CHAVE / PERMISSÕES
        // =====================================

        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 403
        ) {


          return res
            .status(response.status)
            .json({

              error: lastError

            });

        }


        break;

      }

    }


    // =========================================
    // TODOS OS MODELOS FALHARAM
    // =========================================

    return res
      .status(503)
      .json({

        error:
          "Os modelos Gemini estão muito ocupados neste momento. Tenta novamente daqui a pouco.",

        details:
          lastError

      });


  } catch (error) {


    console.error(
      "Erro interno do AI Coach:",
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
