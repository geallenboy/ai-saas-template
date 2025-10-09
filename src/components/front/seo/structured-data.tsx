interface ServerStructuredDataProps {
  data: any
  id: string
}

export function ServerStructuredData({ data, id }: ServerStructuredDataProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
