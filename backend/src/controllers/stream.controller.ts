import { generateLiveKitToken } from "@/config/livekit";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";


export const generate_livekit_token = asyncHandler(async (req: Request, res: Response) => {

    const { roomName, identity } = req.query;
    if (typeof roomName !== 'string' || typeof identity !== 'string') throw new ApiError(400, 'roomName and identity are required')
    const { token, livekitUrl } = await generateLiveKitToken(identity, roomName)

    return res.json(
        new ApiResponse(200, { token, livekitUrl }, 'Success')
    )

})