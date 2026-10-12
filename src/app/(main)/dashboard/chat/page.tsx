import { MessageCircle } from "lucide-react";

const page = () => {
  return (
    <div className="flex flex-1 size-full flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div className="rounded-full bg-muted p-3">
        <MessageCircle className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-semibold text-foreground">
          No conversation selected
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Start a new chat from the sidebar to message people or agents.
        </p>
      </div>
    </div>
  );
};

export default page;
