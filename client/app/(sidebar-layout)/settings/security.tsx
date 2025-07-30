"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ManageSessionsDialog } from '@/components/dialog/manage-sessions-dialog'

const Security = () => {

    const [showSessionsDialog, setShowSessionsDialog] = useState(false)

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Active Sessions</Label>
                            <p className="text-sm text-muted-foreground">Manage devices where you're currently logged in</p>
                        </div>
                        <Button onClick={() => setShowSessionsDialog(true)} variant="outline">Manage</Button>
                    </div>
                </CardContent>
            </Card>
            <ManageSessionsDialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog} />
        </>
    )
}

export default Security