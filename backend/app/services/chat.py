import httpx

from app.core.config import get_settings


def ask_report_chat(question: str, report_context: str) -> str:
    settings = get_settings()
    if not settings.groq_api_key:
        return (
            "Groq key is not configured yet. Add GROQ_API_KEY in backend .env to enable AI chat. "
            "Temporary guidance: prioritize high-severity findings and P1 recommendations first."
        )

    payload = {
        "model": settings.groq_model,
        "messages": [
            {
                "role": "system",
                "content": "You are an audit assistant. Give concise, actionable answers based only on report context.",
            },
            {"role": "user", "content": f"Report context:\n{report_context}\n\nQuestion:\n{question}"},
        ],
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"}

    with httpx.Client(timeout=30) as client:
        response = client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"]
