"use client";

import { useRef, useState } from "react";
import { CheckIcon, Glasses } from "lucide-react";

import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputButton,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { SUGGESTED_AGENTS } from "@/features/agents/lib/constants";
import { models } from "@/lib/models";

export default function AgentsPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedModelData = models.find((m) => m.id === model);

  const handleSubmit = (
    promptMessage: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const prompt = promptMessage.text.trim();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setSubmittedPrompt(prompt);
    setMessage("");

    // Frontend demo only. No agent or AI API is called.
    window.setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex size-full flex-1 flex-col overflow-hidden">
      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className="flex w-full max-w-2xl flex-col items-center">
          <div className="mb-10 flex items-center gap-2.5">
            <Glasses className="size-8 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">
              Super Agents
            </h1>
          </div>

          <PromptInput
            onSubmit={handleSubmit}
            className="w-full rounded-2xl p-1"
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              placeholder="Tell us what you want automated and we'll build your agent"
              className="min-h-16"
              disabled={isLoading}
            />

            <PromptInputFooter className="pt-2">
              <PromptInputTools>
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData?.chefSlug && (
                        <ModelSelectorLogo
                          provider={selectedModelData.chefSlug}
                        />
                      )}
                      {selectedModelData?.name && (
                        <ModelSelectorName>
                          {selectedModelData.name}
                        </ModelSelectorName>
                      )}
                    </PromptInputButton>
                  </ModelSelectorTrigger>

                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>
                        No models found.
                      </ModelSelectorEmpty>

                      <ModelSelectorGroup
                        heading={selectedModelData?.chef || "Models"}
                      >
                        {models.map((m) => (
                          <ModelSelectorItem
                            key={m.id}
                            onSelect={() => {
                              setModel(m.id);
                              setModelSelectorOpen(false);
                            }}
                            value={m.id}
                          >
                            <ModelSelectorLogo provider={m.chefSlug} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>

                            <ModelSelectorLogoGroup>
                              {m.providers.map((provider) => (
                                <ModelSelectorLogo
                                  key={provider}
                                  provider={provider}
                                />
                              ))}
                            </ModelSelectorLogoGroup>

                            {model === m.id ? (
                              <CheckIcon className="ml-auto size-4" />
                            ) : (
                              <div className="ml-auto size-4" />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

              <PromptInputSubmit
                disabled={!message.trim() || isLoading}
                className="size-8 rounded-full"
              />
            </PromptInputFooter>
          </PromptInput>

          {submittedPrompt && (
            <div className="mt-4 w-full rounded-xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Demo prompt submitted
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {submittedPrompt}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Agent creation requires an AI/backend integration.
              </p>
            </div>
          )}

          <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {SUGGESTED_AGENTS.map((agent) => {
              const Icon = agent.icon;

              return (
                <button
                  key={agent.title}
                  type="button"
                  onClick={() => handleSuggestionClick(agent.description)}
                  disabled={isLoading}
                  className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors hover:bg-accent/50 disabled:opacity-50"
                >
                  <Icon className="size-3.5 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{agent.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
