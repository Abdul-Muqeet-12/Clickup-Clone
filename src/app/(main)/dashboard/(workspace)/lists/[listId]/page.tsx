"use client";

import TaskListView from "@/features/tasks/components/task-list-view";
import TaskBoardView from "@/features/tasks/components/task-board-view";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import {
  listViewParser,
  VIEW_PARAM,
} from "@/features/lists/lib/constants";

export default function ListPage() {
  const params = useParams<{ listId: string }>();
  const [view] = useQueryState(VIEW_PARAM, listViewParser);

  const listId = params.listId;

  return (
    <div className="mt-4 flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden px-6 pb-6">
        {view === "list" ? (
          <TaskListView listId={listId} />
        ) : (
          <TaskBoardView listId={listId} />
        )}
      </div>
    </div>
  );
}
