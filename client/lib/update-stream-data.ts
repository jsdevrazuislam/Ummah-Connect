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
