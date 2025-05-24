import React from 'react'
import ConversationPage from '@/app/(sidebar-layout)/messages/[id]/message-details';

const ConversationDetails = async ({ params }: { params: { id: string } }) => {
    const id = await params;

    return (
        <ConversationPage params={id} />
    )
}

export default ConversationDetails