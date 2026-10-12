
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import type { Space } from "../features/spaces/lib/types";

// Shared in-memory store: all useSpaces() instances use the same data.
let spacesStore: Space[] = [];

const listeners = new Set<(spaces: Space[]) => void>();

function updateSpaces(updater: (current: Space[]) => Space[]) {
  spacesStore = updater(spacesStore);
  listeners.forEach((listener) => listener(spacesStore));
}

function makeId<T extends "spaces" | "lists">(): Id<T> {
  return crypto.randomUUID() as Id<T>;
}

export function useSpaces() {
  const [storedSpaces, setStoredSpaces] = useState<Space[]>(spacesStore);
  const [openSpaces, setOpenSpaces] = useState<Set<string>>(new Set());
  const [hasInitializedOpenSpaces, setHasInitializedOpenSpaces] =
    useState(false);

  useEffect(() => {
    const listener = (spaces: Space[]) => setStoredSpaces(spaces);

    listeners.add(listener);
    setStoredSpaces(spacesStore);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!hasInitializedOpenSpaces && storedSpaces.length > 0) {
      setOpenSpaces(new Set(storedSpaces.map((space) => space._id)));
      setHasInitializedOpenSpaces(true);
    }
  }, [storedSpaces, hasInitializedOpenSpaces]);

  const spaces: Space[] = storedSpaces.map((space) => ({
    ...space,
    isOpen: hasInitializedOpenSpaces
      ? openSpaces.has(space._id)
      : true,
  }));

  const toggleSpace = (spaceId: Id<"spaces">) => {
    setHasInitializedOpenSpaces(true);

    setOpenSpaces((previous) => {
      const next = new Set(previous);

      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }

      return next;
    });
  };

  const createSpaceWithDefaults = async (values: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }) => {
    const spaceId = makeId<"spaces">();
    const listId = makeId<"lists">();
    const now = Date.now();

    const newList = {
      _id: listId,
      _creationTime: now,
      name: "List",
      spaceId,
      order: 0,
    };

    const newSpace = {
      _id: spaceId,
      _creationTime: now,
      name: values.name,
      description: values.description ?? "",
      color: values.color,
      icon: values.icon,
      lists: [newList],
    } as unknown as Space;

    updateSpaces((previous) => [...previous, newSpace]);

    setOpenSpaces((previous) => new Set([...previous, spaceId]));
    setHasInitializedOpenSpaces(true);
  };

  const updateSpace = async (
    id: Id<"spaces">,
    values: {
      name: string;
      description?: string;
      color: string;
      icon: string;
    },
  ) => {
    updateSpaces((previous) =>
      previous.map((space) =>
        space._id === id
          ? { ...space, ...values, description: values.description ?? "" }
          : space,
      ),
    );
  };

  const deleteSpace = async (id: Id<"spaces">) => {
    updateSpaces((previous) =>
      previous.filter((space) => space._id !== id),
    );

    setOpenSpaces((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  };

  const reorderSpaces = useCallback(
    (orderedIds: Id<"spaces">[]) => {
      updateSpaces((previous) => {
        const byId = new Map(previous.map((space) => [space._id, space]));

        return [
          ...orderedIds
            .map((id) => byId.get(id))
            .filter((space): space is Space => Boolean(space)),
          ...previous.filter((space) => !orderedIds.includes(space._id)),
        ];
      });
    },
    [],
  );

  const createList = async (spaceId: Id<"spaces">, name: string) => {
    const listId = makeId<"lists">();

    updateSpaces((previous) =>
      previous.map((space) => {
        if (space._id !== spaceId) return space;

        const newList = {
          _id: listId,
          _creationTime: Date.now(),
          name,
          spaceId,
          order: space.lists.length,
        };

        return {
          ...space,
          lists: [...space.lists, newList],
        } as Space;
      }),
    );
  };

  const updateList = async (
    id: Id<"lists">,
    values: { name: string; spaceId: Id<"spaces"> },
  ) => {
    updateSpaces((previous) => {
      let targetList: Space["lists"][number] | undefined;

      const withoutList = previous.map((space) => ({
        ...space,
        lists: space.lists.filter((list) => {
          if (list._id === id) {
            targetList = list;
            return false;
          }

          return true;
        }),
      }));

      if (!targetList) return previous;

      return withoutList.map((space) =>
        space._id === values.spaceId
          ? {
              ...space,
              lists: [
                ...space.lists,
                { ...targetList!, name: values.name, spaceId: values.spaceId },
              ],
            }
          : space,
      ) as Space[];
    });
  };

  const deleteList = async (id: Id<"lists">) => {
    updateSpaces((previous) =>
      previous.map((space) => ({
        ...space,
        lists: space.lists.filter((list) => list._id !== id),
      })) as Space[],
    );
  };

  const reorderLists = useCallback(
    (spaceId: Id<"spaces">, orderedIds: Id<"lists">[]) => {
      updateSpaces((previous) =>
        previous.map((space) => {
          if (space._id !== spaceId) return space;

          const byId = new Map(
            space.lists.map((list) => [list._id, list]),
          );

          return {
            ...space,
            lists: [
              ...orderedIds
                .map((id) => byId.get(id))
                .filter(
                  (list): list is Space["lists"][number] => Boolean(list),
                ),
              ...space.lists.filter((list) => !orderedIds.includes(list._id)),
            ],
          };
        }) as Space[],
      );
    },
    [],
  );

  return {
    spaces,
    isLoading: false,
    toggleSpace,
    createSpaceWithDefaults,
    updateSpace,
    deleteSpace,
    reorderSpaces,
    createList,
    updateList,
    deleteList,
    reorderLists,
  };
}
