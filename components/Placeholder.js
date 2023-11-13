export default function Placeholder() {
  return (
    <div className="p-4 md:p-6 h-full border border-th-secondary-100 bg-th-secondary-10 shadow rounded-xl animate-pulse">
      <div className="mb-4 h-2.5 w-1/4 bg-th-secondary-100 rounded-full"></div>
      {[...Array(6).keys()].map((el) => (
        <div key={el}>
          <div className="h-2 mb-4 bg-th-secondary-100 rounded-full"></div>
        </div>
      ))}
    </div>
  )
}
