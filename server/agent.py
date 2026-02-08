"""Simple multi-round reasoning agent scaffolding.

This module provides a minimal structure for a multi-round agent that can
iteratively refine an answer. The actual model calls can be plugged into
`_call_model`.
"""

import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Optional, Callable, Dict, Any

import requests
from django.conf import settings
from django.template import Engine, Context, TemplateDoesNotExist


@dataclass
class AgentStep:
	"""Represents a single reasoning round."""

	round_index: int
	prompt: str
	response: str
	notes: Optional[str] = None


@dataclass
class AgentResult:
	"""Final result of the agent run."""

	answer: str
	steps: List[AgentStep] = field(default_factory=list)


class MultiRoundAgent:
	"""A simple agent that performs multiple rounds to refine an answer."""

	def __init__(
		self,
		max_rounds: int = 3,
		model_fn: Optional[Callable[[str, Dict[str, Any]], str]] = None,
		prompt_dir: Optional[Path] = None,
		initial_template: str = 'initial.txt',
		refine_template: str = 'refine.txt'
	) -> None:
		if not settings.configured:
			settings.configure(USE_I18N=False)
		self.max_rounds = max_rounds
		self.model_fn = model_fn or self._call_model
		self.prompt_dir = prompt_dir or (Path(__file__).resolve().parent / 'prompts')
		self.initial_template = initial_template
		self.refine_template = refine_template
		self.engine = Engine(dirs=[str(self.prompt_dir)])

	def run(self, question: str, context: Optional[Dict[str, Any]] = None) -> AgentResult:
		context = context or {}
		steps: List[AgentStep] = []
		current_prompt = self._build_initial_prompt(question, context)
		answer = ""

		for i in range(self.max_rounds):
			response = self.model_fn(current_prompt, context)
			steps.append(AgentStep(round_index=i + 1, prompt=current_prompt, response=response))
			answer = response
			current_prompt = self._build_refine_prompt(question, answer, context, i + 1)

		return AgentResult(answer=answer, steps=steps)

	def _build_initial_prompt(self, question: str, context: Dict[str, Any]) -> str:
		return self._render_template(
			self.initial_template,
			{
				'question': question,
				'context': context
			},
			fallback=(
				"You are a helpful assistant. Answer the question concisely.\n"
				f"Question: {question}\n"
				f"Context: {context}"
			)
		)

	def _build_refine_prompt(self, question: str, prior_answer: str, context: Dict[str, Any], round_index: int) -> str:
		return self._render_template(
			self.refine_template,
			{
				'round_index': round_index,
				'question': question,
				'prior_answer': prior_answer,
				'context': context
			},
			fallback=(
				"Refine the previous answer if needed. Keep it concise.\n"
				f"Round: {round_index}\n"
				f"Question: {question}\n"
				f"Previous answer: {prior_answer}\n"
				f"Context: {context}"
			)
		)

	def _render_template(self, template_name: str, variables: Dict[str, Any], fallback: str) -> str:
		try:
			template = self.engine.get_template(template_name)
			return template.render(Context(variables))
		except TemplateDoesNotExist:
			return fallback

	def _call_model(self, prompt: str, context: Dict[str, Any]) -> str:
		"""Call the same model endpoint used in app.py."""
		api_key = os.getenv('OPENAI_API_KEY')
		if not api_key:
			raise RuntimeError('OPENAI_API_KEY not set')

		model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
		system_prompt = (
			'You are a concise budget advisor. Use the provided context to give actionable, safe, '
			'non-judgmental spending and saving guidance. Keep responses under 8 bullet points.'
		)

		messages = [
			{'role': 'system', 'content': system_prompt},
			{'role': 'user', 'content': f"Context: {context}"},
			{'role': 'user', 'content': prompt}
		]

		resp = requests.post(
			'https://api.openai.com/v1/chat/completions',
			headers={
				'Authorization': f'Bearer {api_key}',
				'Content-Type': 'application/json'
			},
			json={
				'model': model,
				'messages': messages,
				'temperature': 0.4,
				'max_tokens': 300
			},
			timeout=30
		)

		if not resp.ok:
			raise RuntimeError(f'Upstream error {resp.status_code}: {resp.text}')

		payload = resp.json()
		return payload['choices'][0]['message']['content']

