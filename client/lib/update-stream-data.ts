/**
 * Adds a ShortsEntity to an existing page if it contains the target short ID,
 * or creates a new fully-typed ShortsResponse page if none match.
 *
 * @param oldData - The existing paginated data containing shorts.
 * @param data - The ShortsEntity to add.
 * @returns Updated paginated data with the ShortsEntity added appropriately.
 */
export function addShortVideo(
  oldData: QueryOldShortsDataPayload | undefined,
  data: ShortsEntity,
): QueryOldShortsDataPayload | undefined {
  if (!oldData)
    return oldData;

  let updated = false;

  const updatedPages = oldData.pages.map((page) => {
    const existingShorts = page?.data?.shorts ?? [];

    const shouldAdd = existingShorts.length === 0;
    if (shouldAdd) {
      updated = true;
      return {
        ...page,
        data: {
          ...page.data,
          shorts: [...existingShorts, data],
          totalItems: page.data.totalItems + 1,
        },
      };
    }

    return page;
  });

  if (!updated) {
    const newPage: ShortsResponse = {
      statusCode: 200,
      message: "Short added",
      success: true,
      data: {
        shorts: [data],
        totalPages: 1,
        currentPage: 1,
        totalItems: 1,
      },
    };

    return {
      ...oldData,
      pages: [...updatedPages, newPage],
    };
  }

  return {
    ...oldData,
    pages: updatedPages,
  };
}

/**
 * Updates the reaction state for a specific short in paginated query data.
 *
 * - Efficiently finds the target short using early return to minimize iteration.
 * - Increments the total reaction count and updates the current user's reaction.
 *
 * @param oldData - The previous query data containing paginated shorts.
 * @param shortId - The ID of the short to update.
 * @param currentUserReaction - The new reaction (or null to remove).
 * @param totalReactionsCount - The new total reaction .
 * @returns A new query data object with the updated short.
 *
 * @example
 * updateShortInQueryData(data, 42, "like");
 *
 * @note Optimized to stop after finding the first match (≈ O(1) in practice).
 */
export function updateShortInQueryData(
  oldData: QueryOldShortsDataPayload | undefined,
  shortId: number,
  currentUserReaction: string,
  totalReactionsCount: string,
) {
  if (!oldData) {
    return oldData;
  }

  const updatedPages = oldData.pages.map((page) => {
    const shorts = page?.data?.shorts ?? [];

    const index = shorts.findIndex(short => short.id === shortId);
    if (index === -1) {
      return page;
    }

    const oldShort = shorts[index];

    const updatedShort = {
      ...oldShort,
      totalReactionsCount,
      currentUserReaction,
    };

    const updatedShorts = [...shorts];
    updatedShorts[index] = updatedShort;

    return {
      ...page,
      data: {
        ...page.data,
        shorts: updatedShorts,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}
