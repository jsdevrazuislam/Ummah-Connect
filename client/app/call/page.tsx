import React from 'react'
import CallInterface from '@/app/call/call-interface'

const CallPage = async ({ searchParams }: { searchParams: { [key: string]: string } }) => {

    const { room, type } = await searchParams

    return (
        <CallInterface roomName={room} callType={type} />
    )
}

export default CallPage