import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;
export const roomServiceClient = new RoomServiceClient(livekitUrl!, livekitApiKey, livekitApiSecret);


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


export const generateLiveToken = async ({
  roomName,
  userId,
  userName,
  isPublisher = false,
}: {
  roomName: string;
  userId: string;
  userName: string;
  isPublisher?: boolean;
}) => {
  const token = new AccessToken(
    livekitApiKey!,
    livekitApiSecret!,
    {
      identity: userId,
      name: userName,
    }
  );

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isPublisher,
    canSubscribe: true,
    canPublishData: true,
  });

  return await token.toJwt();
};