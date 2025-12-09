import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePermissions } from "@/hooks/usePermissions"
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

interface WorkflowControlsProps {
  projectId: string
  currentStage: string
  canAdvance: boolean
  canMoveBack: boolean
  onAdvance: (comment?: string) => Promise<void>
  onMoveBack: (comment?: string) => Promise<void>
}

export const WorkflowControls = ({
  currentStage,
  canAdvance,
  canMoveBack,
  onAdvance,
  onMoveBack,
}: WorkflowControlsProps) => {
  const { hasPermission } = usePermissions()
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const canAdvanceWorkflow = hasPermission("ADVANCE_WORKFLOW")
  const canMoveBackWorkflow = hasPermission("MOVE_BACK_WORKFLOW")

  const handleAdvance = async () => {
    try {
      setLoading(true)
      await onAdvance(comment || undefined)
      setComment("")
    } catch (error) {
      console.error("Failed to advance workflow:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoveBack = async () => {
    try {
      setLoading(true)
      await onMoveBack(comment || undefined)
      setComment("")
    } catch (error) {
      console.error("Failed to move back workflow:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Current Stage: <span className="font-medium text-foreground">{currentStage}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about this workflow change..."
            />
          </div>
        </div>
        <div className="flex gap-4">
          {canAdvanceWorkflow && (
            <Button onClick={handleAdvance} disabled={!canAdvance || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Advance to Next Stage
                </>
              )}
            </Button>
          )}
          {canMoveBackWorkflow && (
            <Button onClick={handleMoveBack} disabled={!canMoveBack || loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Move Back
                </>
              )}
            </Button>
          )}
          {!canAdvanceWorkflow && !canMoveBackWorkflow && (
            <p className="text-sm text-muted-foreground">You don't have permission to modify workflow</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
