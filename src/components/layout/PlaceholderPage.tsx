import { useParams } from "react-router-dom"

export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  const params = useParams()
  const paramEntries = Object.entries(params)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      {paramEntries.length > 0 ? (
        <dl className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
          {paramEntries.map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="font-mono">{key}:</dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}
