"""
Juiz AWS Bedrock para o DeepEval — Pop & Doce
Modelo: qwen.qwen3-coder-30b-a3b-v1:0 (mesmo usado pelo Promptfoo da squad)
Região: us-east-1

Lê as credenciais AWS do ambiente ou do .env na raiz do projeto:
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY
    AWS_SESSION_TOKEN   (opcional — necessário para credenciais temporárias)
    AWS_REGION          (opcional — padrão us-east-1)
"""

import json
import os

import boto3
from dotenv import load_dotenv
from deepeval.models import DeepEvalBaseLLM

# Carrega .env da raiz do projeto (dois níveis acima de deepeval/)
ROOT = os.path.join(os.path.dirname(__file__), "..")
load_dotenv(os.path.join(ROOT, ".env"))

# Modelo e região — iguais ao Promptfoo da squad
BEDROCK_MODEL_ID = os.getenv(
    "BEDROCK_MODEL_ID", "qwen.qwen3-coder-30b-a3b-v1:0"
)
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")


class BedrockJudge(DeepEvalBaseLLM):
    """
    Modelo customizado DeepEval que usa AWS Bedrock via boto3.
    Compatível com FaithfulnessMetric e HallucinationMetric.
    """

    def __init__(
        self,
        model_id: str = BEDROCK_MODEL_ID,
        region: str = AWS_REGION,
        max_tokens: int = 768,
        temperature: float = 0.0,
    ):
        self.model_id = model_id
        self.region = region
        self.max_tokens = max_tokens
        self.temperature = temperature
        self._client = None

    def get_model_name(self) -> str:
        return self.model_id

    def _get_client(self):
        """Cria o cliente boto3 na primeira chamada (lazy init)."""
        if self._client is None:
            session_kwargs = {"region_name": self.region}

            key_id = os.getenv("AWS_ACCESS_KEY_ID")
            secret = os.getenv("AWS_SECRET_ACCESS_KEY")
            token = os.getenv("AWS_SESSION_TOKEN")

            if key_id and secret:
                session_kwargs["aws_access_key_id"] = key_id
                session_kwargs["aws_secret_access_key"] = secret
                if token:
                    session_kwargs["aws_session_token"] = token

            session = boto3.Session(**session_kwargs)
            self._client = session.client("bedrock-runtime")
        return self._client

    def load_model(self):
        """Exigido pelo DeepEvalBaseLLM — retorna o cliente boto3."""
        return self._get_client()

    def generate(self, prompt: str) -> str:
        """
        Envia o prompt para o Bedrock via Converse API e retorna o texto gerado.
        Mesmo endpoint usado pelo Promptfoo da squad.
        """
        client = self._get_client()

        response = client.converse(
            modelId=self.model_id,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ],
            inferenceConfig={
                "maxTokens": self.max_tokens,
                "temperature": self.temperature,
            },
        )

        return response["output"]["message"]["content"][0]["text"]

    async def a_generate(self, prompt: str) -> str:
        """Versão assíncrona — delega para generate() de forma síncrona."""
        return self.generate(prompt)
