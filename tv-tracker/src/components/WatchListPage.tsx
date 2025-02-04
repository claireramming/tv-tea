export default function WatchListPage(props: { sessionId: string }) {
  if (!props.sessionId) {
    return (
      <div>
        <h1>Watch List</h1>
        <p>Please log in to view your watch list.</p>
      </div>
    )
  }
  return (
    <div>
      <h1>Watch List</h1>
    </div>
  )

}