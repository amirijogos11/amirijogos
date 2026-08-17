// =============================================
// 🚀 ROCKET LEAGUE AI COACH - API
// Vercel Serverless Function
// =============================================


// ---------------------------------------------
// CORS
// Permite ao teu site GitHub Pages usar esta API
// ---------------------------------------------

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};


// ---------------------------------------------
// CONFIGURAÇÕES PERMITIDAS
// ---------------------------------------------

const VALID_RANKS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Champion",
  "Grand Champion",
  "SSL"
];


const VALID_CONTROLS = [
  "Controller",
  "Keyboard and Mouse"
];


// ---------------------------------------------
// PERSONALIDADE / INSTRUÇÕES DO COACH
// ---------------------------------------------

const COACH_INSTRUCTIONS = `
You are Rocket Coach AI, a friendly and highly skilled Rocket League coach.

Your job is to help Rocket League players improve their mechanics,
game sense, consistency and training.

You can teach and explain:

- Wave Dash
- Fast Aerial
- Normal Aerial
- Half Flip
- Speed Flip
- Air Dribble
- Ground Dribble
- Flicks
- Double Taps
- Ceiling Shots
- Wall Shots
- Powershots
- Recoveries
- Kickoffs
- Air Roll
- Car Control
- Aerial Control
- Rotation
- Positioning
- Boost Management
- Shadow Defence
- Shooting
- Saving
- Free Play Training


COACHING RULES:

1. Adapt every explanation to the player's rank.

2. Adapt controls depending on whether the player uses:
   - Controller
   - Keyboard and Mouse

3. Explain mechanics using simple numbered steps.

4. If the player is a beginner, keep explanations easy.

5. If the player is advanced, you may give more precise timing
   and advanced advice.

6. If the player says that a mechanic is not working,
   diagnose the most likely mistakes.

7. Give useful practice drills.

8. Give measurable goals.

Example:
"Try to complete 5 clean wave dashes in a row."

9. When useful, structure a lesson like this:

🎯 MECHANIC
⭐ DIFFICULTY
🎮 CONTROLS
📚 HOW TO DO IT
❌ COMMON MISTAKES
🏋️ PRACTICE DRILL
✅ GOAL
➡️ NEXT STEP

10. Don't overwhelm the player with huge walls of text.

11. Talk like a friendly gaming coach,
    not like a school textbook.

12. Be encouraging but realistic.

13. Never claim that the player performed something successfully
    unless they tell you that they did.

14. Stay focused mainly on Rocket League.

15. Do not help players cheat, hack, exploit,
    or interfere with other players.

16. If a question is unclear, make the best reasonable assumption
    and give useful Rocket League advice.

17. For most normal questions, keep the answer concise.

18. If the player asks for a training routine,
    organize it by minutes and exercises.

19. If they ask what mechanic they should learn next,
    use their rank to recommend an appropriate progression.

20. When possible, end lessons with a clear practice challenge.
`;



// =============================================
// VERCEL FUNCTION
// =============================================

export default {

  async fetch(request) {


    // -----------------------------------------
    // Handle browser CORS check
    // -----------------------------------------

    if (request.method === "OPTIONS") {

      return new Response(
        null,
        {
          status: 204,
          headers: CORS_HEADERS
        }
      );

    }



    // -----------------------------------------
    // Only POST is allowed
    // -----------------------------------------

    if (request.method !== "POST") {

      return new Response(

        JSON.stringify({
          error: "Only POST requests are allowed."
        }),

        {
          status: 405,
          headers: CORS_HEADERS
        }

      );

    }



    // -----------------------------------------
    // Check API key
    // -----------------------------------------

    if (!process.env.OPENAI_API_KEY) {

      console.error(
        "OPENAI_API_KEY environment variable is missing."
      );


      return new Response(

        JSON.stringify({
          error: "The AI Coach has not been configured yet."
        }),

        {
          status: 500,
          headers: CORS_HEADERS
        }

      );

    }



    try {


      // =======================================
      // READ DATA FROM coach.html
      // =======================================

      const body =
        await request.json();



      // ---------------------------------------
      // Validate rank
      // ---------------------------------------

      const rank =
        VALID_RANKS.includes(body.rank)
          ? body.rank
          : "Unknown";



      // ---------------------------------------
      // Validate controls
      // ---------------------------------------

      const controls =
        VALID_CONTROLS.includes(body.controls)
          ? body.controls
          : "Unknown";



      // ---------------------------------------
      // Get conversation
      // ---------------------------------------

      const receivedMessages =
        Array.isArray(body.messages)
          ? body.messages
          : [];



      if (receivedMessages.length === 0) {

        return new Response(

          JSON.stringify({
            error: "You need to send a question."
          }),

          {
            status: 400,
            headers: CORS_HEADERS
          }

        );

      }



      // =======================================
      // CLEAN THE MESSAGES
      //
      // Only keep the last 10 messages.
      // Also prevent gigantic messages.
      // =======================================

      const safeMessages =
        receivedMessages
          .slice(-10)
          .map((message) => {

            const role =
              message.role === "assistant"
                ? "assistant"
                : "user";


            const content =
              String(
                message.content || ""
              )
                .trim()
                .slice(0, 2000);


            return {
              role,
              content
            };

          })
          .filter(
            message =>
              message.content.length > 0
          );



      if (safeMessages.length === 0) {

        return new Response(

          JSON.stringify({
            error: "Your question was empty."
          }),

          {
            status: 400,
            headers: CORS_HEADERS
          }

        );

      }



      // =======================================
      // PLAYER INFO
      // =======================================

      const playerContext = `
PLAYER PROFILE

Rank: ${rank}
Controls: ${controls}

Use this profile when answering the player's Rocket League questions.
`;



      // =======================================
      // BUILD OPENAI INPUT
      // =======================================

      const openAIInput = [

        {
          role: "user",
          content: playerContext
        },

        ...safeMessages

      ];



      // =======================================
      // SEND REQUEST TO OPENAI
      // =======================================

      const openAIResponse =
        await fetch(
          "https://api.openai.com/v1/responses",
          {

            method: "POST",

            headers: {

              "Authorization":
                `Bearer ${process.env.OPENAI_API_KEY}`,

              "Content-Type":
                "application/json"

            },


            body: JSON.stringify({

              model: "gpt-5.6",

              instructions:
                COACH_INSTRUCTIONS,

              input:
                openAIInput,

              max_output_tokens:
                900,

              store:
                false

            })

          }
        );



      // =======================================
      // READ OPENAI RESPONSE
      // =======================================

      const data =
        await openAIResponse.json();



      // =======================================
      // HANDLE OPENAI ERROR
      // =======================================

      if (!openAIResponse.ok) {

        console.error(
          "OpenAI API error:",
          JSON.stringify(data)
        );


        let message =
          "The AI Coach could not answer right now.";


        if (
          openAIResponse.status === 401
        ) {

          message =
            "The OpenAI API key is invalid.";

        }


        if (
          openAIResponse.status === 429
        ) {

          message =
            "The AI Coach is busy or the API limit was reached. Try again soon.";

        }


        return new Response(

          JSON.stringify({
            error: message
          }),

          {
            status: openAIResponse.status,
            headers: CORS_HEADERS
          }

        );

      }



      // =======================================
      // FIND THE GENERATED TEXT
      // =======================================

      const reply =
        (data.output || [])

          .flatMap(
            item =>
              item.content || []
          )

          .filter(
            part =>
              part.type === "output_text"
          )

          .map(
            part =>
              part.text || ""
          )

          .join("\n")

          .trim();



      // =======================================
      // MAKE SURE WE GOT AN ANSWER
      // =======================================

      if (!reply) {

        console.error(
          "OpenAI returned no output_text:",
          JSON.stringify(data)
        );


        return new Response(

          JSON.stringify({
            error: "The coach didn't generate an answer."
          }),

          {
            status: 500,
            headers: CORS_HEADERS
          }

        );

      }



      // =======================================
      // SEND ANSWER BACK TO coach.html
      // =======================================

      return new Response(

        JSON.stringify({

          reply: reply

        }),

        {
          status: 200,
          headers: CORS_HEADERS
        }

      );


    } catch (error) {


      // =======================================
      // UNKNOWN ERROR
      // =======================================

      console.error(
        "Rocket League Coach error:",
        error
      );


      return new Response(

        JSON.stringify({
          error: "Something went wrong while contacting the AI Coach."
        }),

        {
          status: 500,
          headers: CORS_HEADERS
        }

      );


    }

  }

};
