# ⚡ Quick Cheat Sheet: Project Pitch & Cross-Questions

Use this cheat sheet to memorize your short answers and prepare for cross-questions regarding the reseller model, AI reasoning features, and edge cases.

---

## 🚀 1. The Short Pitch: "What is your recent project?" (4 Sentences)

> "My recent project is **New Raj Fancy Store**, a social-commerce platform built with React Native and Node.js. 
> 
> It features a **multi-tier reseller financial engine** where independent sellers can share apparel on social media with custom markups, which are held in a secure digital wallet until the return window expires. 
> 
> To enhance product discovery, I built a **multimodal AI Shopping Assistant** using Gemini 2.5 Flash that processes visual uploads, handles semantic search using vector embeddings, and retrieves store policy context via RAG.
> 
> I also integrated a web-socket-powered **Developer Diagnostic Terminal** inside the mobile app for live server monitoring and security overrides."

---

## 🧠 2. The AI & Reasoning Features (Focusing on Gemini 2.5 Flash)

If they ask specifically about the AI agent's "reasoning" or "intelligence":

> "We leverage Gemini 2.5 Flash because it natively supports **multimodal inputs** and **agentic tool calling**. 
> 
> The 'reasoning' happens because the LLM acts as an autonomous coordinator: when a user sends a photo or a query, the model reasons about the user's intent. If it's looking for clothing, it decides to invoke the `search_catalog` tool; if it's asking a policy question, it triggers the `get_store_policy` tool. The model is not just generating text; it is orchestrating backend APIs."

---

## 🔀 3. Cross-Questions: Reseller & Transaction Scenarios

### Scenario A: "What happens if a customer returns an order? Does the reseller still get paid?"
*   **The Trap:** If you don't handle this, resellers can exploit the platform by ordering and immediately returning items to collect commissions.
*   **Your Answer:** 
    > "Absolutely not. When an order is placed, the reseller commission is marked as `pending` and locked. If the customer initiates a return, the backend updates the order status to `returned` and ultimately `refunded` via the `OrderStateMachine`. 
    > 
    > Inside the state machine logic, transitioning to `refunded` automatically triggers a reversal function: we deduct the commission amount from the reseller's `pendingBalance` and mark their `resellerEarningStatus` as `cancelled` before it ever reaches their withdrawable balance."

### Scenario B: "How do you prevent race conditions or double-credits in the wallet?"
*   **The Trap:** A reseller clicks the "withdraw" button three times in rapid succession, resulting in multiple withdrawals before the database can subtract the balance.
*   **Your Answer:** 
    > "We implement two critical safeguards. First, in our database models, we perform **atomic operations** (using Mongoose `$inc` and status checks). 
    > 
    > Second, when a withdrawal is requested, the controller immediately checks if the wallet's `availableBalance` is greater than or equal to the requested amount. We deduct the balance **first**, save it, and then create the withdrawal record. This prevents double-spend race conditions."

### Scenario C: "How does the shared margin link work under the hood?"
*   **The Trap:** Can a tech-savvy user change the URL query parameters (like `?margin=50`) to cheat the system?
*   **Your Answer:** 
    > "No, URL manipulation is guarded against. The link contains a referral code that binds the reseller ID and product ID. 
    > 
    > When a buyer checks out, the backend doesn't trust the client's URL parameters blindly. The server validates the margin against the configuration settings (e.g., must be between 5% and 30%) and cross-checks the base wholesale price of the product from our database to recalculate the actual checkout total, discarding any unauthorized edits."

---

## ⚠️ 4. What to AVOID Saying (Crucial Tips)

1.  **AVOID: "I used an AI to write the whole project."**
    *   *Instead say:* "I paired with an advanced agentic AI as my co-developer. I acted as the System Architect—defining the MongoDB models, designing the security guards, and structuring the state machine—while the AI generated boilerplate code."
2.  **AVOID: "Our vector search uses an expensive production cloud DB."**
    *   *Instead say:* "For the MVP, I built an in-memory vector store that computes Cosine Similarity in JavaScript. However, it's designed to be drop-in compatible with MongoDB Atlas Vector Search or Pinecone when scaling."
3.  **AVOID: "The app is completely done and production-ready with zero bugs."**
    *   *Instead say:* "It's a fully functional prototype. The architecture is solid, and I've covered the critical safety guardrails like pricing security, status state machine rules, and auth verification."
