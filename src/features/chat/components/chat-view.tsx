"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputTextarea,
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
import { models } from "@/lib/models";

type DemoMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const assistants: Record<string, string> = {
  "agent-1": "AI Assistant",
  "agent-2": "Writing Assistant",
  "agent-3": "Coding Assistant",
};

export function ChatView() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId ?? "";
  const agentName = assistants[threadId] ?? "AI Assistant";

  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [message, setMessage] = useState("");
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedModelData = models.find((m) => m.id === model);

  const handleSubmit = (
    promptMessage: PromptInputMessage,
    _event: React.FormEvent<HTMLFormElement>,
  ) => {
    const trimmed = promptMessage.text.trim();

    if (!trimmed || isSending) return;

    const userMessage: DemoMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setIsSending(true);

    // Demo reply only; this does not call an AI API.
    window.setTimeout(() => {
      const reply: DemoMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: `This is a frontend demo for ${agentName}. Your message was: "${trimmed}". Connect an AI API to receive real AI-generated responses.`,
      };

      setMessages((previous) => [...previous, reply]);
      setIsSending(false);
    }, 500);
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-muted text-sm">
            {agentName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h1 className="truncate font-semibold text-foreground">
          {agentName}
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Conversation className="size-full">
          <ConversationContent className="px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-4 py-12 text-center">
                <div>
                  <h2 className="text-lg font-semibold">{agentName}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Send a message to try this chat demo.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>
                    <MessageResponse>{msg.text}</MessageResponse>
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>

          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="px-4 py-3">
        <PromptInput
          onSubmit={handleSubmit}
          className="w-full rounded-2xl p-1"
        >
          <PromptInputTextarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={`Write to ${agentName}...`}
            className="min-h-5"
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
                      {models.map((item) => (
                        <ModelSelectorItem
                          key={item.id}
                          onSelect={() => {
                            setModel(item.id);
                            setModelSelectorOpen(false);
                          }}
                          value={item.id}
                        >
                          <ModelSelectorLogo provider={item.chefSlug} />
                          <ModelSelectorName>
                            {item.name}
                          </ModelSelectorName>

                          <ModelSelectorLogoGroup>
                            {item.providers.map((provider) => (
                              <ModelSelectorLogo
                                key={provider}
                                provider={provider}
                              />
                            ))}
                          </ModelSelectorLogoGroup>

                          {model === item.id ? (
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
              disabled={!message.trim() || isSending}
              className="size-8 rounded-full"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}