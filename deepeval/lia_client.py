"""
Cliente HTTP para a API da Lia (Pop & Doce).
Lê LIA_API_KEY e LIA_API_URL do arquivo .env na raiz do projeto.
"""

import os
import time
import requests
from dotenv import load_dotenv

# Sobe dois níveis a partir de deepeval/ para encontrar o .env na raiz
ROOT = os.path.join(os.path.dirname(__file__), "..")
load_dotenv(os.path.join(ROOT, ".env"))

API_URL = os.getenv(
    "LIA_API_URL",
    "https://rm4naioqykxiti2srofnqz6hqa0ctlav.lambda-url.us-east-1.on.aws/",
)
API_KEY = os.getenv("LIA_API_KEY", "")


def chamar_lia(mensagem: str, sessao: str = None, prompt_sistema: str = None) -> dict:
    """
    Chama a API da Lia e retorna o dict completo da resposta.
    Faz até 3 tentativas em caso de erro 429 ou 502.
    """
    if not API_KEY:
        raise EnvironmentError("LIA_API_KEY não definida. Configure o arquivo .env na raiz do projeto.")

    corpo = {"mensagem": mensagem}
    if sessao:
        corpo["sessao"] = sessao
    if prompt_sistema:
        corpo["prompt_sistema"] = prompt_sistema

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    }

    for tentativa in range(1, 4):
        resp = requests.post(API_URL, json=corpo, headers=headers, timeout=45)
        if resp.status_code == 429:
            print(f"  [429] muitas chamadas — aguardando {tentativa * 3}s...")
            time.sleep(tentativa * 3)
            continue
        if resp.status_code == 502:
            print(f"  [502] falha no backend — aguardando {tentativa * 3}s...")
            time.sleep(tentativa * 3)
            continue
        resp.raise_for_status()
        return resp.json()

    raise RuntimeError("API da Lia não respondeu após 3 tentativas.")


def resposta_texto(mensagem: str, sessao: str = None, prompt_sistema: str = None) -> str:
    """Atalho que retorna apenas o texto da resposta da Lia."""
    return chamar_lia(mensagem, sessao, prompt_sistema)["resposta"]
