import { AccessToken } from "livekit-server-sdk";

const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

export const generateLiveKitToken = async (
  identity: string,
  roomName: string,
  avatar?: string | null, 
  fullName?: string | null 
) => {
  const at = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: identity,
    name: fullName || identity,
    ttl: "10m",
    metadata: JSON.stringify({ 
      avatar: avatar,
      fullName: fullName,
    }),
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: false
  });

  const token = await at.toJwt();
  return { token, livekitUrl };
};
