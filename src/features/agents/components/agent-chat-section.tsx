"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { models } from "@/lib/models";

interface AgentChatSectionProps {
  threadId: string;
}

interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function AgentChatSection({ threadId }: AgentChatSectionProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const selectedModelData = models.find((item) => item.id === model);

  const handleSendMessage = (
    promptMessage: PromptInputMessage,
    _event: React.FormEvent<HTMLFormElement>,
  ) => {
    const prompt = promptMessage.text.trim();

    if (!prompt || isSubmitting) return;

    const userMessage: DemoMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: prompt,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setIsSubmitting(true);

    // Frontend demo: no AI API or backend request.
    window.setTimeout(() => {
      const assistantMessage: DemoMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: `This is a frontend demo. Your message was: "${prompt}". Connect an AI service to get real AI responses.`,
      };

      setMessages((previous) => [...previous, assistantMessage]);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="flex w-full min-w-0 flex-col border-r p-1 md:w-[480px] md:shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/agents" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Conversation className="size-full">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center px-4 text-center">
                <h2 className="font-semibold">Agent Chat</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Send a message to try the frontend demo.
                </p>
              </div>
            ) : (
              messages.map((item) => (
                <Message key={item.id} from={item.role}>
                  <MessageContent>
                    <MessageResponse>{item.text}</MessageResponse>
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <PromptInput
        onSubmit={handleSendMessage}
        className="w-full rounded-2xl p-1"
      >
        <PromptInputTextarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask questions or update your Super Agent"
          className="min-h-[60px]"
          disabled={isSubmitting}
        />

        <PromptInputFooter className="flex justify-between">
          <PromptInputTools>
            <ModelSelector
              open={modelSelectorOpen}
              onOpenChange={setModelSelectorOpen}
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
                  <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                  <ModelSelectorGroup
                    heading={selectedModelData?.chef || "Models"}
                  >
                    {models.map((item) => (
                      <ModelSelectorItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => {
                          setModel(item.id);
                          setModelSelectorOpen(false);
                        }}
                      >
                        <ModelSelectorLogo provider={item.chefSlug} />
                        <ModelSelectorName>{item.name}</ModelSelectorName>

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
            disabled={!message.trim() || isSubmitting}
            className="size-8 rounded-full"
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}