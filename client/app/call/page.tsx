import React from 'react'
import CallInterface from '@/app/call/call-interface'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN } from '@/constants';


const CallPage = async ({ searchParams }: { searchParams: { [key: string]: string } }) => {

    const { room, type, authToken } = await searchParams
    const cookie = await cookies();
    const token = cookie.get(ACCESS_TOKEN)?.value;

    if (!room || !type || !authToken) {
        redirect('/');
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/stream/validate-call-token?roomName=${room}&authToken=${authToken}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        redirect('/');
    }


    return (
        <CallInterface roomName={room} callType={type} />
    )
}

export default CallPage