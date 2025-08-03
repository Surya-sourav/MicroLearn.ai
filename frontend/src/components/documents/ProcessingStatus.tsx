import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react"

interface ProcessingStatusProps {
  status: "pending" | "processing" | "completed" | "failed"
}

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
          label: "Pending",
        }
      case "processing":
        return {
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
          label: "Processing",
        }
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/20",
          label: "Ready",
        }
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-100 dark:bg-red-900/20",
          label: "Failed",
        }
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-900/20",
          label: "Unknown",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bgColor}`}>
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className={config.color}>{config.label}</span>
    </div>
  )
}
