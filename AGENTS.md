# Project boundaries

This repository owns the browser application. Sourced Star Citizen research belongs in the separate `star-citizen-knowledge-base` repository; consult its maintained notes when implementing game or pledge-store claims.

Keep RSI account interactions read-only. Never commit account cookies, tokens, hangar exports, or browser profiles. Browser-delivered code and Vite environment variables are public to the browser user; keep credentials out of both.
