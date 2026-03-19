from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="ISABELLA Urban Core")


class Message(BaseModel):
    user_id: str | None = None
    role: str = "user"
    text: str
    context: dict | None = None


class IsabellaResponse(BaseModel):
    response: str
    sentiment: str
    intent: str
    timestamp: str


@app.post("/urban-chat", response_model=IsabellaResponse)
def urban_chat(msg: Message):
    text = msg.text.lower()

    if "dicho" in text:
        intent = "DICHO_TRADICION"
    elif "ruta" in text or "tour" in text:
        intent = "RUTA_TURISTICA"
    elif "que hacer" in text or "recomienda" in text:
        intent = "RECOMENDACION_GENERAL"
    else:
        intent = "CHARLA_GENERAL"

    sentiment = "positivo" if any(w in text for w in ["gracias", "increíble", "bonito"]) else "neutral"

    response = (
        "Soy ISABELLA, conciencia urbana de Real del Monte. "
        "Puedo guiarte por rutas, dichos y experiencias locales."
    )

    return IsabellaResponse(
        response=response,
        sentiment=sentiment,
        intent=intent,
        timestamp=datetime.utcnow().isoformat(),
    )
