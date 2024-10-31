export default function Placeholder() {
  return (
    <div className="h-full animate-pulse rounded-xl border border-th-secondary-100 bg-th-secondary-10 p-4 shadow md:p-6">
      <div className="mb-4 h-2.5 w-1/4 rounded-full bg-th-secondary-100"></div>
      {[...Array(6).keys()].map((el) => (
        <div key={el}>
          <div className="mb-4 h-2 rounded-full bg-th-secondary-100"></div>
        </div>
      ))}
    </div>
  )
}
