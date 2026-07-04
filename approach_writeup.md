# GharFind AI: Indian Real Estate Approach & Design Trade-offs
**Project:** GharFind AI - Autonomous Property-Discovery Agent
**Author:** Khushi U Poonja
**Submission Date:** July 4, 2026

---

## 1. Executive Summary
Finding a home is a complex multi-criteria optimization problem. In the Indian market, this is further shaped by specific housing metrics (such as BHK - Bedroom Hall Kitchen spacing), unique pricing denominations (Lakhs and Crores), and challenging traffic/transit commute profiles.

This project implements an **Autonomous Property-Discovery Web Application (GharFind AI)** built using a full-stack **Next.js (React + TypeScript)** framework. The core system combines:
1. A **Conversational Chat Interface** enabling natural language preference extraction, tailored to understand Indian real estate terms (like "3 BHK", "1.5 Cr", "Hebbal").
2. A **Custom Agentic Loop** capable of executing tools autonomously (property database querying, school ratings analysis, safety checks, and commute routing).
3. A **Deterministic Multi-Criteria Utility Ranker** to calculate normalized compatibility scores for listing matches.
4. A **Premium Glassmorphic Dashboard** to visualize match scores, school ratings, and commute factors.

To ensure immediate usability by evaluators, the app operates in two modes: **Mock Agent Mode** (zero setup, works instantly using keyword heuristics and simulated thought logs) and **Live LLM Mode** (plugs into Gemini or OpenAI APIs with genuine LLM function calling).

---

## 2. System Architecture & Flow
The application follows a clean unidirectional flow:

```
[ User Input ] ---> [ Chat Dashboard ] ---> [ Next.js API Route ]
                                                    |
                                            [ Agentic Executor ]
                                                    |
                         +--------------------------+-------------------------+
                         | (Tools Execution)                                  |
               [ Search Listings ] <---> [ Neighborhood Safety & Schools ] <---> [ Commute Calculator ]
                         |
             [ Deterministic Ranker ]
                         |
           [ LLM Response Synthesis ] ---> [ Visual Dashboard Output ]
```

### Components:
- **Frontend Dashboard**: A responsive dashboard containing a Sidebar (API key configuration, workplace location override, and preference weights), a Chat Interface (complete with an accordion-style **Agent Thought Log** mapping out tool calls), and a **Ranked Shortlist Panel** showing compatibility scores in Indian notation (Lakhs/Crores).
- **Agentic Executor (API Route)**: Coordinates conversation history, extracts housing criteria, runs the tool execution loop, compiles data, and invokes the deterministic ranker.
- **Commute Calculator**: Uses the **Haversine formula** to calculate geographic distance between properties and the buyer's workplace, then applies transport mode coefficients (driving, transit, walking, bicycling) and heavy traffic delays (e.g. driving average at 25 km/h with 10 min congestion buffer) to estimate door-to-door commute times in Indian cities.

---

## 3. The Ranking Engine: Multi-Criteria Utility Theory
Rather than relying on the LLM to qualitatively rank properties (which is prone to hallucinations and mathematical inconsistency), we implement a **Deterministic Utility Function** that scores properties on a `0-100%` compatibility scale. 

The score is a weighted average of five category sub-scores:
$$\text{Match Score} = \frac{\sum (S_i \times W_i)}{\sum W_i}$$

Where:
- $S_i$ represents the sub-score for category $i$ (Price, BHK Space, Schools, Safety, Commute).
- $W_i$ represents the weight priority (integer 1-5, defaults to 3).

### Sub-Score Formulations:
1. **Price Match ($S_{\text{price}}$)**: 
   - If Price $\le$ Budget: $S_{\text{price}} = 100$. (A small bonus is added for properties under budget, capped at 100).
   - If Price $>$ Budget: $S_{\text{price}} = \max\left(0, 100 - \frac{\text{Price} - \text{Budget}}{\text{Budget}} \times 150\right)$. A sharp linear penalty is applied if a listing exceeds the budget.
2. **Space Match ($S_{\text{space}}$)**:
   - Evaluates BHK (Bedroom-Hall-Kitchen) and bathroom counts. A penalty of $-30\%$ is applied per missing bedroom/BHK and $-20\%$ per missing bathroom.
3. **School Match ($S_{\text{school}}$)**:
   - Computes the average rating of nearby schools (Primary, Middle, Senior School, scale 1-10). If the average meets the buyer's target, score is $100$. Otherwise, it drops by $20\%$ per point under the target.
4. **Safety Match ($S_{\text{safety}}$)**:
   - Evaluates the neighborhood safety score (1-100). If it meets the target, score is $100$. Otherwise, it drops by $3\%$ per index point under the target.
5. **Commute Match ($S_{\text{commute}}$)**:
   - Computes estimated commute time ($T$). If $T \le T_{\text{target}}$ (default 30 mins), score is $100$. For every minute exceeding the target, the score drops by $3\%$.

---

## 4. Key Engineering Trade-Offs

### A. Custom Agent Loop vs. Frameworks (LangChain, LlamaIndex)
* **Decision**: We implemented a lightweight, custom TypeScript agent loop instead of using bulky orchestration libraries.
* **Trade-off**: While frameworks provide pre-built abstractions, they introduce massive dependency overhead, lock developers into rigid structures, and are prone to breaking changes. A custom loop using standard `fetch` queries directly to Gemini/OpenAI API endpoints is transparent, easy to debug, has zero bundle-size bloat, and provides granular control over the tool logs shown to the user.

### B. Deterministic Ranker vs. LLM Ranker
* **Decision**: We separated the math from the language: the system calculates the scores deterministically, and the LLM translates the scores into conversational justifications.
* **Trade-off**: LLMs are notorious for poor mathematical consistency (e.g. ranking a ₹2.8 Cr home over a ₹2.2 Cr home when budget is ₹2.5 Cr). A deterministic ranker guarantees that the shortlist is mathematically correct and consistent. The LLM is then used for what it does best: qualitative synthesis, highlighting specific property descriptions, and explaining *why* the property is an excellent match.

### C. Client-Side vs. Server-Side Execution
* **Decision**: The agent runs inside Next.js API Routes, while preference states and configuration reside in React state.
* **Trade-off**: Running the LLM on the server side keeps API keys secure and allows server-side logging. Tying the preferences and shortlist back to the frontend in JSON format allows the UI to render visual gauges and cards instantly, creating a highly interactive dashboard experience.

---

## 5. Future Enhancements & Production Roadmap
If given more time, we would implement the following features for a production-grade rollout in India:
1. **Real-time API integrations**: Connect to platforms like MagicBricks or Housing.com for live listings, local school directories for school ratings, and Google Maps API with live Indian traffic routing.
2. **Interactive Map Panel**: Embed a Mapbox or Leaflet component to show candidate pins, neighborhood boundaries (like Indiranagar, BKC, Sector 62), and transit paths.
3. **User Profile System**: Database integration (Prisma + PostgreSQL) to store buyer search histories, favorited shortlists, and notes.
4. **Vastu Shastra Optimization**: Adding a secondary utility sub-score for properties meeting Vastu compliance requirements, which is a highly valued feature for many Indian home buyers.
