import { generateLiveKitToken } from "@/config/livekit";
import redis from "@/config/redis";
import { SocketEventEnum } from "@/constants";
import { User } from "@/models";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";


export const generate_livekit_token = asyncHandler(async (req: Request, res: Response) => {

    const { roomName, identity } = req.query;
    if (typeof roomName !== 'string' || typeof identity !== 'string') throw new ApiError(400, 'roomName and identity are required')
    const { token, livekitUrl } = await generateLiveKitToken(identity, roomName, req.user.avatar, req.user.full_name)

    return res.json(
        new ApiResponse(200, { token, livekitUrl }, 'Success')
    )

})

export const initiate_call = asyncHandler(async (req: Request, res: Response) => {
    const { roomName, callType, authToken, receiverId } = req.body;
    const callerId = req.user.id;
    const user = req.user

    if (!roomName || !authToken || !receiverId) throw new ApiError(400, 'Missing data');

    await redis.set(
        `call-token:${roomName}:${authToken}`,
        authToken,
        'EX',
        60
    );

    await redis.set(
        `call:${roomName}`,
        JSON.stringify({ callerId, receiverId, type: callType, status: 'pending' }),
        'EX',
        60
    );

    const socket = req.app.get("io")

    socket.to(`user:${receiverId}`).emit(SocketEventEnum.INCOMING_CALL, {
        from: user?.id,
        authToken: authToken,
        callType: callType,
        roomName: roomName,
        callerName: user?.full_name,
        callerAvatar: user?.avatar,
    });

    const receiverUser = await User.findOne({ where: { id: receiverId}})

    setTimeout(async () => {
        const callData = await redis.get(`call:${roomName}`);
        if (callData) {
            const call = JSON.parse(callData);
            if (call.status === 'pending') {
                socket.to(`user:${callerId}`).emit(SocketEventEnum.CALL_TIMEOUT, {
                    roomName,
                    reason: "NO_ANSWER",
                    message: `${receiverUser?.full_name} didn't answer your call.`,
                    callerName: receiverUser?.full_name,
                    callerAvatar: receiverUser?.avatar,
                });
                socket.to(`user:${receiverId}`).emit(SocketEventEnum.CALL_TIMEOUT, {
                    roomName,
                    reason: "NO_ANSWER",
                    message: "You missed a call.",
                    callerName: user?.full_name,
                    callerAvatar: user?.avatar,
                });
                await redis.del(`call:${roomName}`);
                await redis.del(`call-token:${roomName}:${authToken}`);
            }
        }
    }, 50000);

    res.status(200).json(new ApiResponse(200, null, 'Call initialized'));
});


export const validate_call_token = asyncHandler(async (req: Request, res: Response) => {
    const { roomName, authToken } = req.query;
    const userId = req.user.id

    if (!roomName || !authToken) {
        throw new ApiError(400, 'Missing required query params');
    }

    const storedToken = await redis.get(`call-token:${roomName}:${authToken}`);
    if (!storedToken || storedToken !== authToken) {
        throw new ApiError(403, 'Invalid or expired call token');
    }

    const callMetadata = await redis.get(`call:${roomName}`);
    if (!callMetadata) {
        throw new ApiError(404, 'Call metadata not found');
    }

    const { callerId, receiverId } = JSON.parse(callMetadata);

    if (String(userId) !== String(callerId) && String(userId) !== String(receiverId)) {
        throw new ApiError(403, 'You are not authorized to join this call');
    }

    return res.status(200).json(new ApiResponse(200, null, 'Token and user validated'));
});
