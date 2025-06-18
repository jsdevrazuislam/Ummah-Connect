export async function enableMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return stream;
  } catch (error) {
    console.error("Media permissions denied:", error);
    throw error;
  }
}