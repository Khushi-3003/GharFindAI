# GharFind AI: Autonomous Property-Discovery Agent

An autonomous, conversational AI agent built on a full-stack **Next.js** framework that helps Indian home buyers find, analyze, and shortlist properties. The agent reasons over natural language preferences (BHK configurations, Rupee budgets), queries property databases, evaluates school quality and neighborhood safety, calculates commute times, and generates a mathematically ranked shortlist with structured justifications.

---

## 🌟 Features
* **Conversational AI Interface**: Interactively extract budget, BHK count, city, and commute parameters.
* **Indian Market Adaptation**: Full support for Lakhs (L) and Crores (Cr) currency parsing and BHK (Bedroom-Hall-Kitchen) terminology.
* **Agentic Thought Log**: Expandable accordion detailing step-by-step reasoning and tool execution logs.
* **Multi-Criteria Utility Ranker**: Deterministic utility-based sorting algorithm to ensure ranking consistency.
* **Built-in Commute Estimator**: Coordinate distance & heavy urban traffic transit mode speed scaling (no API key required).
* **Dual Execution Modes**:
  * **Mock Engine Mode (Zero Config)**: Runs locally using regex heuristics. Works instantly out-of-the-box for evaluation.
  * **Live LLM Mode**: Supports **Gemini** (default: `gemini-2.5-flash`) and **OpenAI** (default: `gpt-4o-mini`) APIs with genuine function calling.
* **Interactive Glassmorphic UI**: High-fidelity dark mode dashboard with comparison models and score gauges.

---

## 🛠️ System Architecture

```mermaid
flowchart TD
    User([User]) <--> UI[React Frontend: Dashboard, Chat & Map]
    UI <--> API[Next.js API Routes: Agent Executor]
    
    subgraph Agent Loop (Backend / API Route)
        LLM[LLM Agent: Gemini / OpenAI / Mock]
        Parser[Preferences Parser]
        Ranker[Deterministic Multi-Criteria Ranker]
    end
    
    API <--> LLM
    LLM <--> Parser
    LLM <--> Tools[Agent Tools]
    
    subgraph Tools & Data Sources
        P_DB[(Property Database: 20+ Indian Listings)]
        S_DB[(School ratings by Pincode)]
        N_DB[(Neighborhood Safety Stats)]
        C_Calc[Commute Calculator: Geo-distance & Traffic]
    end
    
    Tools --> P_DB
    Tools --> S_DB
    Tools --> N_DB
    Tools --> C_Calc
    
    LLM --> Ranker
    Ranker --> UI
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### Installation

1. Clone or download the repository to your local directory.
2. Open your terminal in the project folder.
3. Install the dependencies:
   ```bash
   npm install
   ```
   *(Note: If you run into local certificate errors in your network, run `npm config set strict-ssl false` first).*

### Running the App

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 How to Test the Agent

### 1. Testing in Mock Mode (Default)
No API key required.
1. Type a natural language prompt in the input bar:
   > *"I want to buy a 3 BHK in Bengaluru under 2.5 Crores. I work at Manyata Tech Park and commute on a bicycle. Good schools are very important to me."*
2. Click **Send**.
3. **Analyze Response**:
   * Inspect the **Extracted Search Preferences** panel on the right. Notice how the city, max price (parsed to standard Rupees), BHK, and commute details are extracted.
   * Expand the **Show Agentic Thought Steps** accordion under the agent reply. See the mock database queries, school checks, safety evaluations, and commute calculations.
   * Review the **Ranked Property Shortlist** on the far right. Properties are dynamically sorted based on your constraints and priorities.
4. **Interactive Modal**: Click any property card in the shortlist to view compatibility gauges, nearby school listings, neighborhood walkability indexes, and custom agent justifications.
5. **Follow-up Interaction**: Type *"Actually, price is my absolute top priority"* or *"Let's change commute to driving"*. The agent will dynamically update preferences and re-rank the shortlist!

### 2. Testing in Live LLM Mode
Requires a Gemini or OpenAI API Key.
1. Toggle the **Agent Execution Mode** button in the sidebar from **Mock Engine** to **Live LLM**.
2. Select your provider (Gemini or OpenAI).
3. Input your API Key (e.g., `AIzaSy...` or `sk-proj-...`).
4. Type your prompt. The agent will run a live extraction and synthesis loop using the selected model.

---

## ⚙️ Environment Variables (Optional)
While keys can be entered directly on the frontend dashboard for ease of evaluation, you can also pre-load variables by creating a `.env.local` file in the project root:

```env
# Optional Pre-loaded Keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key_here
```

---

## 📈 Design Decisions & Trade-Offs
For a detailed analysis of our engineering decisions (such as using a Custom Agent Loop over LangChain, utilizing a deterministic ranker over LLM ranking, and implementation of the Haversine commute routing engine), please refer to the [Approach & Trade-offs Write-up](approach_writeup.md) in the project root.
