import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Follow } from "@/models";


export const followUnFollow = asyncHandler(async(req:Request, res:Response) =>{

    const targetUserId = Number(req.params.id)
    const currentUserId = req.user.id

    if(currentUserId === targetUserId) throw new ApiError(400, "You can't follow yourself")

    const [follow, created] = await Follow.findOrCreate({
        where:{
            followerId: currentUserId,
            followingId: targetUserId
        }
    })

    if(!created) {
        await Follow.destroy({
            where: {
            followerId: currentUserId,
            followingId: targetUserId
            }
        });

        return res.json(new ApiResponse(200, null, 'Unfollowed successfully'));
    }

    return res.json(
        new ApiResponse(200, follow, 'Followed Successfully')
    )
})